"use client";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from 'uuid';
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading,setLoading]=useState(false);
  const [JsonResponse,setJsonResponse]=useState([]);
  const router=useRouter();
  const {user}=useUser();
  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDescription, jobExperience);
    const InputPrompt = "Job position:" + jobPosition + " , Job Description:" + jobDescription + " , Years of experience:" + jobExperience + ",Depends on Job Position, JOB Description & Years of experience give us " + process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT + " Interview question along with Answered in JSON format,Give us question and answered field on JSON";

    const result = await chatSession.sendMessage(InputPrompt);
    const MockJsonResp=(result.response.text()).replace('```json','').replace('```','');
    console.log(JSON.parse(MockJsonResp));
    setJsonResponse(MockJsonResp);
    
    if(MockJsonResp)
    {
    const resp=await db.insert(MockInterview)
    .values({mockId:uuidv4(),
      jsonMockResp:MockJsonResp,
      jobPosition:jobPosition,
      jobDescription:jobDescription,
      jobExperience:jobExperience,
      createdBy:user?.primaryEmailAddress?.emailAddress,
      createdAt:moment().format('DD-MM-yyyy')
     }).returning({mockId:MockInterview.mockId});

     console.log("Inserted ID:",resp);
     if(resp)
      {
           setOpenDialog(false);
           router.push('/dashboard/interview/'+resp[0]?.mockId)
      }
    }
    else{
      console.log("ERROR");
    }

    setLoading(false); // Close modal after submission
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>

      {/* ✅ Ensure Dialog opens/closes correctly */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job interview
            </DialogTitle>
          </DialogHeader>

          {/* ✅ Form is outside DialogDescription to prevent hydration error */}
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogDescription>
              Add details about your job position/role, job description, and years of experience.
            </DialogDescription>

            <div className="mt-4">
              <label>Job Role / Job Description</label>
              <Input
                placeholder="Ex. Full Stack Developer"
                required
                onChange={(event) => setJobPosition(event.target.value)}
              />
            </div>

            <div className="my-3">
              <label>Job Description / Tech Stack (In Short)</label>
              <Textarea
                placeholder="Ex. React, Angular, Node.js, MySQL, etc."
                required
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </div>

            <div className="my-3">
              <label>Years of Experience</label>
              <Input
                placeholder="Ex. 5"
                type="number"
                max="50"
                required
                onChange={(event) => setJobExperience(event.target.value)}
              />
            </div>

            <div className="flex gap-5 justify-end">
              <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading?
                <>
                <LoaderCircle className='animate-spin'/>'Generating from AI'
                </>:'Start Interview'}

                </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;