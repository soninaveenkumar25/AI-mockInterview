"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Webcam from "react-webcam";
import { useParams } from "next/navigation";  // ✅ Use this for getting params dynamically in Client Component
import Link from "next/link";

function Interview() {
    const params = useParams();  // ✅ Fetch route params correctly in Client Component
    const [interviewData, setInterviewData] = useState(null);
    const [webCamEnabled, setWebCamEnabled] = useState(false);

    useEffect(() => {
        if (!params?.interviewId) return;  // ✅ Ensure param exists before fetching data
        const fetchData = async () => {
            await GetInterviewDetails();
        };
        fetchData();
    }, [params?.interviewId]);

    /**
     * Fetch interview details using MockId/InterviewId
     */
    const GetInterviewDetails = async () => {
        const result = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewId));

        setInterviewData(result.length > 0 ? result[0] : null);
    };

    return (
        <div className="my-10">
            <h2 className="font-bold text-2xl">Let's Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Interview Details */}
                <div className="flex flex-col my-5 gap-5">
                    {interviewData ? (
                        <div className="flex flex-col p-5 rounded-lg border gap-5">
                            <h2 className="text-lg">
                                <strong>Job Role/Job Position:</strong> {interviewData.jobPosition}
                            </h2>
                            <h2 className="text-lg">
                                <strong>Job Description/Tech Stack:</strong> {interviewData.jobDescription}
                            </h2>
                            <h2 className="text-lg">
                                <strong>Years of Experience:</strong> {interviewData.jobExperience}
                            </h2>
                        </div>
                    ) : (
                        <p className="text-gray-500">Loading interview details...</p>
                    )}

                    {/* Information Section */}
                    <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
                        <h2 className="flex gap-2 items-center text-yellow-500">
                            <Lightbulb />
                            <strong>Information</strong>
                        </h2>
                        <h2 className="mt-3 text-yellow-500">
                            {process.env.NEXT_PUBLIC_INFORMATION || "No additional info available"}
                        </h2>
                    </div>
                </div>

                {/* Webcam Section */}
                <div>
                    {webCamEnabled ? (
                        <Webcam
                            onUserMedia={() => setWebCamEnabled(true)}
                            mirrored={true}
                            style={{
                                height: 300,
                                width: 300,
                            }}
                        />
                    ) : (
                        <>
                            <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary rounded-lg border" />
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setWebCamEnabled(true)}
                            >
                                Enable Web Cam and Microphone
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Start Interview Button */}
            <div className="flex justify-end items-end">
                <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
                <Button className="bg-blue-500 text-white">Start Interview</Button>

                </Link>
                
            </div>
        </div>
    );
}

export default Interview;
