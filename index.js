import express from "express";
import { initializeDatabase } from "./db/db.connect.js";
import Comment from "./models/comments.models.js";
import Lead from "./models/leads.models.js";
import SalesAgent from "./models/salesagents.models.js";
import Tag from "./models/tags.models.js";

import fs from 'fs'
import cors from "cors"
import dotenv from 'dotenv'
import exp from "constants";

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

initializeDatabase()

// const commentData = JSON.parse(fs.readFileSync('commentsData.json', 'utf-8'))
// const leadsData = JSON.parse(fs.readFileSync('leadsData.json', 'utf-8'))
// const salesAgentData = JSON.parse(fs.readFileSync('salesAgentData.json','utf-8'))
 
 
// async function seedData() {
//     try{

//         // Leads Seeding
//         for(const lead of leadsData){
//             const newLead = new Lead({
// name: lead.name,
// source: lead.source,
// salesAgent: lead.salesAgent,
// comments:lead.comments,
// status: lead.status,
// tags: lead.tags,
// timeToClose:lead.timeToClose,
// priority:lead.priority,
// createdAt:lead.createdAt,
// updatedAt: lead.updatedAt,
// closedAt:lead.closedAt,
//             })
//             await newLead.save()
//         }
//         console.log("Leads seeded successfully.")


//         // SalesAgent Data Seeding
//         for (const salesAgent of salesAgentData){
//             const newsalesAgent = new SalesAgent({
// name: salesAgent.name,
// email: salesAgent.email,
//             })
//             await newsalesAgent.save()
//         }
//         console.log("Sales Agent Data seeded successfully.")

//         // Comments Seeding
//         for(const comment of commentData){
//             const newComments = new  Comment({
//                 commentText: comment.commentText,
               
               
//             })
//             await newComments.save()
//         }
//         console.log("Comments Data seeded successfully.")

//     }catch(error){
//         console.log("An error occured while seeding the data", error)
//     }    
// }
// seedData()

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Lead Routes (4 routes)
// Get all leads
app.get('/leads', async (req, res) => {
    try {
        const { salesAgent, status, tags, source } = req.query;
        const filter = {};

        if (salesAgent) filter.salesAgent = salesAgent;
        if (status) filter.status = status;
        if (tags) filter.tags = { $in: tags.split(',') }; // Supports multiple tags
        if (source) filter.source = source;

        const leads = await Lead.find(filter);
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leads." });
    }
});

// Get a lead by ID
app.get('/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found." });
        }
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch lead." });
    }
});


// Add details to lead (PATCHING)
app.put('/leads/:id', async (req, res) => {
    try {
        const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedLead) {
            return res.status(404).json({ error: "Lead not found." });
        }
        res.json(updatedLead);
    } catch (error) {
        res.status(500).json({ error: "Failed to update lead." });
    }
});

// Create a New Lead (POST /leads)
app.post('/leads', async(req,res)=>{
    try{
        const newLead = new Lead(req.body)
        await newLead.save()
        res.status(201).json({message:"Lead added to database successfully. "})
    }catch(error){
             console.log(error)
        res.status(500).json({error:"Failed to add lead to database."})
    }
})


// Delete a Lead
app.delete("/leads/:id", async(req,res)=>{
    try{
        const leads = await Lead.findByIdAndDelete(req.params.id)
        if(!leads){
            return res.status(404).json({error:"Lead not found"})
        }
        res.status(200).json({message:"Lead deleted successfully."})
    }catch(error){
        res.status(500).json({error:"Failed to delete a Task."})
    }
})


// Sales Agent Routes (2 routes)
// Get all Sales Agent
app.get('/sales-agents', async(req,res)=>{
    try{
        const salesAgent = await SalesAgent.find()
        res.json(salesAgent)
    }catch(error){
        res.status(500).json({error:"Failed to fetch Sales Agent."})
    }
})

// Adding new sales agent 
app.post("/sales-agents", async(req,res)=>{
    try{
        const newSalesAgent = new SalesAgent(req.body)
        await newSalesAgent.save()
        res.status(201).json({message: "Sales Agent Added successfully."})
    }catch(error){
        res.status(500).json({error:"Failed to add Sales Agent."})
    }
})

// Delete a Sales Agent
app.delete("/sales-agents/:id", async (req, res) => {
    try {
        const salesAgent = await SalesAgent.findByIdAndDelete(req.params.id);
        if (!salesAgent) {
            return res.status(404).json({ error: "Sales Agent not found" });
        }
        res.status(200).json({ message: "Sales Agent deleted successfully." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to delete Sales Agent." });
    }
});

// Routes for Comments (2 routes)
// Add a comment to a specific lead
app.post('/leads/:id/comments', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found." });
        }

        const newComment = new Comment({
        
            commentText: req.body.commentText
        });

        await newComment.save();
        res.status(201).json({ message: "Comment added successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment." });
    }
});


  // Get comments for a specific lead
app.get('/leads/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ lead: req.params.id }).populate('author', 'name email');
        if (comments.length === 0) {
            return res.status(404).json({ error: "No comments found for this lead." });
        }
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch comments." });
    }
});

//  Tags routes (2 routes)

// POST Tag (Add Tags)
app.post('/tags', async(req,res)=>{
    try{
        const newTag = new Tag(req.body)
        await newTag.save()
        res.status(201).json({message:"Tag added successfully to lead."})
    }catch(error){
        res.status(500).json({error:"Failed to add tag to lead"})
    }
})

//  Get Tags
app.get('/tags', async(req,res)=>{
    try{
        const tag = await Tag.find()
        res.json(tag)
    }catch(error){
        res.status(500).json({error:"Failed to fetch tags."})
    }
})

// Reporting Routes APIs (3 routes)
 
// Route to get Leads closed last week
app.get('/report/last-week', async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const leads = await Lead.find({
            status: 'Closed',
            closedAt: { $gte: oneWeekAgo }
        });

        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch last week's closed leads." });
    }
});

// Get total Leads in Pipeline
app.get('/report/pipeline', async (req, res) => {
    try {
        const pipeline = await Lead.aggregate([
            { $match: { status: { $ne: 'Closed' } } },
            { $group: { _id: null, totalLeadsInPipeline: { $sum: 1 } } }
        ]);

        res.json(pipeline[0] || { totalLeadsInPipeline: 0 });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pipeline data." });
    }
});

//  Get Leads Closed by Each Sales Agent 
app.get('/report/closed-by-agent', async (req, res) => {
    try {
        const closedByAgent = await Lead.aggregate([
            { $match: { status: 'Closed' } },
            { $group: { _id: "$salesAgent", count: { $sum: 1 } } }
        ]);

        res.json(closedByAgent);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch closed leads by agent." });
    }
});

app.listen(PORT,()=>{
    console.log(`--> Server is running on ${PORT}`)
  })
