
"use client";
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { chatSession } from "@/utils/GeminiAIModal";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { toast } from "sonner";
import { db } from "@/utils/db";

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
  const [isClient, setIsClient] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [displayedAnswer, setDisplayedAnswer] = useState(false);
  const [showPlaceholderImage, setShowPlaceholderImage] = useState(true);
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [fullTranscription, setFullTranscription] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    autoStart: false,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setUserAnswer((prevAns) => prevAns + results.map((r) => r?.transcript).join(" "));
  }, [results]);

  useEffect(() => {
    setFullTranscription(results.map((result) => result.transcript).join(" ") + " ");
  }, [results, interimResult]);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      console.log("Captured image:", imageSrc);
    }
  };

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [userAnswer]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
      console.log("Final Transcription:", userAnswer);
      await UpdateUserAnswer();
    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer = async () => {
    console.log("Updating User Answer:", userAnswer);

    if (userAnswer.length < 10) {
      console.warn("User answer is too short. Skipping update.");
      return;
    }

    setLoading(true);
    const feedbackPrompt =
      "Question: " +
      mockInterviewQuestion[activeQuestionIndex]?.question +
      ", User Answer: " +
      userAnswer +
      ". Based on the question and user answer, please provide a rating and feedback (if any) in just 3 to 5 lines, formatted in JSON with 'rating' and 'feedback' fields.";

    try {
      const result = await chatSession.sendMessage(feedbackPrompt);
      const responseText = await result.response.text();

      const MockJsonResp = responseText
        .replace("```json", "")
        .replace("```", "");

      console.log("Feedback and Rating (Raw):", MockJsonResp);

      const JsonFeedbackResp = JSON.parse(MockJsonResp);
      console.log("Parsed Feedback:", JsonFeedbackResp);

      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      });

      if (resp) {
        toast.success("User Answer recorded successfully");
        setResults([]);
        // ✨ Removed clearing the userAnswer here so it stays visible
      }
    } catch (err) {
      console.error("Error getting feedback or saving to DB:", err);
      toast.error("Failed to save user answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col my-10 justify-center items-center bg-black rounded-lg p-5 relative">
      {isClient ? (
        <>
          {showPlaceholderImage ? (
            <Image
              src="/webcam.png"
              alt="Webcam Placeholder"
              width={250}
              height={150}
              className="rounded-full object-cover"
            />
          ) : (
            <Webcam
              ref={webcamRef}
              videoConstraints={{ facingMode: "user" }}
              audio={true}
              screenshotFormat="image/jpeg"
              width="100%"
              height="300px"
              style={{ zIndex: 10 }}
            />
          )}

          <button
            className={`mt-4 p-3 rounded text-white transition-colors duration-300 ${isRecording ? "bg-red-500" : "bg-green-500"}`}
            onClick={() => {
              if (showPlaceholderImage) setShowPlaceholderImage(false);
              StartStopRecording();
            }}
          >
            {isRecording ? "Stop Recording" : "Record Answer"}
          </button>

          {isRecording && (
            <div className="mt-4 w-full flex flex-col items-center">
              <button className="mt-2 p-2 rounded bg-blue-500 text-white" onClick={capture}>
                Capture Screenshot
              </button>

              <div className="mt-4 bg-gray-800 text-white p-4 rounded w-full text-center">
                <h3 className="font-bold">Transcription:</h3>
                <div className="whitespace-pre-wrap">{fullTranscription}</div>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="mt-4">
              <h3 className="text-white">Captured Image:</h3>
              <img src={capturedImage} alt="Captured Screenshot" className="mt-2 border rounded-lg w-52 h-auto" />
            </div>
          )}

          <div className="mt-4">
            <Button
              onClick={() => {
                setDisplayedAnswer((prev) => !prev);
              }}
            >
              {displayedAnswer ? "Hide User Answer" : "Show User Answer"}
            </Button>
            {displayedAnswer && (
              <div className="mt-4 text-white bg-gray-800 p-4 rounded">
                <h3 className="font-bold">User Answer:</h3>
                <div>{userAnswer}</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-white">Loading...</p>
      )}

      {error && <p className="text-red-500 mt-4">Error: {error}</p>}
    </div>
  );
}

export default RecordAnswerSection;
