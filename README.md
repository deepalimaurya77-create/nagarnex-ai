# NagarNex AI

### Evidence-to-Closure Civic Intelligence for Indian Municipal Corporations

NagarNex AI is an AI-assisted public grievance management prototype designed to help citizens report civic issues and help municipal officers move complaints from submission to verified closure.

The project combines multilingual complaint handling, structured grievance workflows, officer-side supervision, evidence-based closure, and an embedded analytics dashboard in one application.

## Key Features

### Citizen Grievance Portal
- Submit civic complaints through a citizen-facing interface
- Track complaint progress and status
- Clear privacy and usage guidance
- Structured complaint information for easier processing

### AI-Assisted Complaint Processing
- Uses Google's Generative AI SDK
- Supports AI-assisted grievance triage and processing
- Designed for multilingual civic-service interactions
- Helps convert citizen reports into structured information for municipal workflows

### Officer Supervisory Console
- Separate officer-facing workflow
- Complaint review and dispatch support
- Priority-based handling
- Evidence-to-closure workflow
- Closure protocol and supervisory guidance

### Evidence-Based Closure
NagarNex AI is designed around an evidence-to-closure approach rather than simply marking a complaint as resolved. The workflow supports evidence associated with civic issue resolution and provides citizens with status visibility.

### Public Grievance Intelligence Dashboard
An interactive Tableau dashboard provides an analytical view of grievance data, including:

- Total complaints
- Open and resolved complaints
- High-priority open complaints
- Complaint status distribution
- Open complaints by city
- Complaints by category
- Average resolution time

The demonstration dashboard currently contains 100 complaint records for showcasing the analytics workflow.

## Tech Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Lucide React

**Backend**
- Node.js
- Express

**AI**
- Google GenAI SDK (`@google/genai`)

**Analytics**
- Tableau

## Application Workflow

Citizen Complaint  
↓  
AI-Assisted Processing & Triage  
↓  
Complaint Registration  
↓  
Officer Review / Dispatch  
↓  
Resolution Workflow  
↓  
Evidence-Based Closure  
↓  
Analytics & Civic Intelligence

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/deepalimaurya77-create/nagarnex-ai.git
cd nagarnex-ai
