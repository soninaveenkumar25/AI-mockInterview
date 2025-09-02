
"use client";

import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Share2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Assuming params is like: { params: { interviewId: string } }
function Feedback({ params }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id);

      setFeedbackList(result);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ FIXED: Ensure numbers, not string concatenation
  const averageRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((acc, item) => acc + Number(item.rating), 0) /
          feedbackList.length
        ).toFixed(1)
      : "0.0";

  const exportToPDF = async () => {
    const input = document.getElementById('feedback-section');
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('interview-feedback.pdf');
  };

  const copyURL = async () => {
    try {
      const publicBase = typeof window !== "undefined" ? window.location.origin : "";
      const fullLink = `${publicBase}/interview/${params.interviewId}`;
      await navigator.clipboard.writeText(fullLink);
      alert("🔗 Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy the link.");
    }
  };

  return (
    <div className="p-6">
      {loading ? (
        <p className="text-gray-500">Loading feedback...</p>
      ) : feedbackList.length === 0 ? (
        <h2 className="text-xl font-bold">No Interview Feedback Record Found</h2>
      ) : (
        <div id="feedback-section">
          <h2 className="text-2xl font-semibold text-green-600 mb-2">
            🎉 Congratulations!
          </h2>
          <h2 className="text-xl font-bold mb-1">Here is your interview feedback</h2>
          <h2 className="text-primary text-lg my-2">
            Your overall interview rating:{" "}
            <strong className="text-black">{averageRating}/10</strong>
          </h2>
          <h2 className="text-sm text-gray-500 mb-4">
            Below are the interview questions, your answers, correct answers, and suggestions for improvement.
          </h2>

          {feedbackList.map((item, index) => (
            <Collapsible key={index} className="mt-6">
              <CollapsibleTrigger className="p-4 bg-gray-100 rounded-lg flex justify-between items-center text-left gap-4 shadow-md hover:bg-gray-200 transition w-full">
                <span className="font-semibold">{item.question}</span>
                <ChevronsUpDown className="h-5 w-5 text-gray-600" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white p-4 rounded-lg border shadow-sm mt-2 space-y-2">
                  <p className="text-sm text-red-600">
                    <strong>Rating:</strong> {item.rating}
                  </p>
                  <p className="text-sm">
                    <strong>Your Answer:</strong> {item.userAns}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Correct Answer:</strong> {item.correctAns}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Feedback:</strong> {item.feedback}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-6">
        <Button variant="default" onClick={() => router.replace("/dashboard")}>
          Go Home
        </Button>
        <Button variant="outline" onClick={exportToPDF}>
          <FileDown className="h-4 w-4 mr-2" /> Export as PDF
        </Button>
        <Button variant="outline" onClick={copyURL}>
          <Share2 className="h-4 w-4 mr-2" /> Share Link
        </Button>
      </div>
    </div>
  );
}

export default Feedback;
