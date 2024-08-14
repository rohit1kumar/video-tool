import React from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CompressVideo() {
    const [loaded, setLoaded] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [transcodedVideo, setTranscodedVideo] = useState(null);
    const [isTranscoding, setIsTranscoding] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const videoRef = useRef(null);
    const messageRef = useRef(null);

    useEffect(() => {
        loadFFmpeg();
        return () => {
            if (videoRef.current?.src) {
                URL.revokeObjectURL(videoRef.current.src);
            }
        };
    }, []);

    useEffect(() => {
        if (videoFile && videoRef.current) {
            const videoURL = URL.createObjectURL(videoFile);
            videoRef.current.src = videoURL;
            messageRef.current.innerHTML = 'Video uploaded. Ready to compress.';
            return () => {
                URL.revokeObjectURL(videoURL);
            };
        }
    }, [videoFile]);

    const loadFFmpeg = async () => {
        try {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
            const ffmpeg = ffmpegRef.current;

            ffmpeg.on('progress', ({ progress, time }) => {
                const percent = (progress * 100).toFixed(2);
                const seconds = Math.round(time / 1000000);
                messageRef.current.innerHTML = `${percent}% (compressed time: ${seconds} s)`;
            });

            ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            setLoaded(true);
        } catch (error) {
            console.error('Error loading FFmpeg:', error);
            messageRef.current.innerHTML = 'failed to load FFmpeg, refresh and try again.';
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setVideoFile(file);
            setTranscodedVideo(null);
        }
    };

    const handleVideoCompress = async () => {
        if (!videoFile) {
            messageRef.current.innerHTML = 'please upload a video file first.';
            return;
        }

        setIsTranscoding(true);
        const ffmpeg = ffmpegRef.current;
        const inputFileName = videoFile.name;
        const outputFileName = 'output.mp4';
        messageRef.current.innerHTML = 'compression in progress...';

        try {
            await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));
            await ffmpeg.exec(['-i', inputFileName, '-crf', '23', '-preset', 'medium', outputFileName]);
            const data = await ffmpeg.readFile(outputFileName);
            const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });

            if (videoRef.current?.src) {
                URL.revokeObjectURL(videoRef.current.src);
            }
            const videoURL = URL.createObjectURL(compressedBlob);
            videoRef.current.src = videoURL;
            setTranscodedVideo(compressedBlob);

            messageRef.current.innerHTML = 'compression completed, download the video.';
        } catch (error) {
            console.error('Error during compression:', error);
            messageRef.current.innerHTML = 'an error occurred during compression.';
        } finally {
            setIsTranscoding(false);
        }
    };

    const downloadVideo = () => {
        if (transcodedVideo) {
            const url = URL.createObjectURL(transcodedVideo);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'output.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4 text-center">Video Compressor</h1>
            <p className="text-gray-200 mb-8 text-center max-w-md">
                Compress your videos right in your browser. No upload needed!
            </p>

            {!loaded ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-16 h-16 border-t-4 border-yellow-400 border-solid rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-300">loading FFmpeg...</p>
                </div>
            ) : (
                <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="mb-4 p-2 border border-gray-600 rounded-lg bg-blue-50 text-blue-800 placeholder-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 w-64"
                        placeholder="Choose a video file"
                    />

                    {(videoFile || transcodedVideo) && (
                        <video
                            ref={videoRef}
                            controls
                            className="w-full max-h-96 mb-4 rounded-lg shadow-lg"
                        ></video>
                    )}

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 items-center w-full max-w-xs">
                        {!transcodedVideo ? (
                            <button
                                onClick={handleVideoCompress}
                                disabled={isTranscoding || !videoFile}
                                className={`flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded transition-all duration-300 ${isTranscoding || !videoFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                                    }`}
                            >
                                {isTranscoding ? 'compressing...' : 'compress'}
                            </button>
                        ) : (
                            <button
                                onClick={downloadVideo}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-all duration-300"
                            >
                                download
                            </button>
                        )}
                        <Link
                            to="/"
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded transition-all duration-300 text-center"
                        >
                            go back
                        </Link>
                    </div>
                    <p ref={messageRef} className="text-center text-gray-600"></p>
                </div>
            )}
        </div>
    );
}

export default CompressVideo;
