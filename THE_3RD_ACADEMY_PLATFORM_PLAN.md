# The 3rd Academy - Platform Development Plan

## Executive Summary

The 3rd Academy is a virtual proof-based institution that transforms how workplace skills are developed, tested, and verified. Instead of relying on traditional resumes and credentials, the platform provides AI-verified proof of what candidates can actually do through comprehensive skill assessments, real project work, and dynamic verification systems.

## Platform Overview

The 3rd Academy is a **proof-based virtual institution powered by AI and driven by humans**. It focuses on moving beyond traditional credentials to actual proof of capabilities through simulations, assessments, and real project work experiences.

### Core Value Proposition
- **For Candidates**: Transform skills into verifiable proof of workplace readiness
- **For Employers**: Move beyond resumes to see verified proof of candidate abilities
- **For Mentors**: Provide structured environments for skill development and validation

## Target User Segments

### 1. Students
- Plan careers using academic projects and internships
- Create verifiable proof of workplace readiness
- Stand out to employers before graduation

### 2. Professionals
- Showcase real-world experience and upskilling efforts
- Validate expertise and negotiate raises with proof
- Transition into new roles with confidence

### 3. Employers
- Hire with confidence using verified proof
- Reduce hiring risk and save time
- Find perfect fits faster

## Core Platform Features

### 1. 3 a Skill Passport
- Digital record of proven skills (English/French)
- AI-verified competency validation
- Confidence Score™ based on consistency, trend, and depth
- Skills mapped to industry standards and job requirements
- Visual progress charts showing growth over time
- Detailed feedback from mentor ratings and project outcomes

### 2. TalentVisa
- Job-market readiness credential
- Full verification of skills and professional behavior
- Signals preparedness, reliability, and job market-readiness to employers

### 3. T3X Talent Exchange
- Dynamic talent marketplace
- Connect verified candidates with hiring managers
- Turn workplace readiness into real-world access
- Career mobility platform focused on proof over promises

### 4. LiveWorks Studio
- Live work environment
- Apply skills to real contracts and gain hands-on experience
- Cost-effective solutions for clients
- Portfolio strengthening through real work
- Confidence building through practice

### 5. Civic Access Lab
- One-stop digital hub
- Tools for education, housing, and civic support
- Navigation for forms, benefits, and local programs
- Bridge civic systems with human guidance

## Technical Architecture Plan

### Authentication System
- **PiPilot-based authentication** (already implemented)
- JWT token management with refresh capabilities
- Social login integration (future)
- Multi-factor authentication (roadmap)

### User Account Features
- Profile management
- Skill passport history
- Progress tracking and analytics
- Credential management
- Sharing permissions and access controls

## Development Phases

### Phase 1: Core Foundation (Current State)
- ✅ PiPilot authentication system
- ✅ Skill passport generator (PDF output)
- ✅ Responsive UI with dark theme
- ✅ PDF download functionality

### Phase 2: User Management (Next Priority)
- **Dashboard implementation**
- **User profile & settings**
- **Authentication guards for pages**
- **User passport management**

### Phase 3: Enhanced Passport Features
- **Confidence Score™ system**
- **Progress tracking over time**
- **Simulation assessments**
- **Mentor feedback integration**

### Phase 4: Marketplace Implementation
- **Talent Exchange platform**
- **Employer portal**
- **TalentVisa verification system**
- **Job matching algorithms**

### Phase 5: Advanced Learning
- **LiveWorks Studio integration**
- **Project-based learning modules**
- **Real contract work system**
- **Portfolio showcase features**

### Phase 6: Future Features (Q3 2026)
- **BridgeFast Pathways**
- **AI-powered career mapping**
- **Mentorship programs**
- **Advanced analytics**

## Required Pages for Authenticated Users

### Core Dashboard Pages
1. **Dashboard Home** (`/dashboard`) - Main hub with overview
2. **Profile Management** (`/profile`) - Personal information and settings
3. **Skill Passport Creator** (`/skill-passport`) - Enhanced version with user data
4. **Passport History** (`/passports`) - All generated passports with history
5. **Analytics & Insights** (`/analytics`) - Progress tracking and metrics

### Marketplace Pages
6. **Talent Exchange** (`/talent-exchange`) - Job marketplace
7. **TalentVisa Center** (`/talentvisa`) - Readiness credential management
8. **Employer Connections** (`/connections/employers`) - Manage employer relationships

### Learning & Development Pages
9. **Simulations Hub** (`/simulations`) - AI-powered assessments
10. **LiveWorks Studio** (`/liveworks`) - Real project opportunities
11. **Portfolio Showcase** (`/portfolio`) - Project-based evidence display
12. **Mentor Connections** (`/mentors`) - Connect with industry professionals

### Settings & Support Pages
13. **Account Settings** (`/settings`) - Personal preferences and security
14. **Credentials Center** (`/credentials`) - All issued credentials management
15. **Help & Support** (`/support`) - User assistance and documentation

## Implementation Requirements

### Authentication & Security
- All pages require authentication except public landing pages
- Role-based access control (candidate, employer, admin)
- Secure token management with automatic refresh
- GDPR compliance for user data

### Data Management
- User-specific passport storage and retrieval
- Progress tracking with historical data
- Analytics dashboard with visualizations
- File upload and processing for CV/resumes

### Performance & UX Requirements
- Fast loading times (< 3 seconds)
- Mobile-responsive design
- Intuitive navigation and user flow
- Accessible design compliance
- Multi-language support (English/French initially)

### Analytics & Tracking
- User engagement metrics
- Passport generation analytics
- Conversion tracking for job applications
- Platform usage insights

## Technical Implementation Notes

### Frontend Technologies
- Next.js 14 with App Router
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- PDF generation with html2canvas and jsPDF

### Backend & APIs
- PiPilot authentication service
- API integration for passport generation
- PDF generation endpoints
- File upload and processing capabilities

### Database Integration
- PiPilot database for user management
- Passport history and metadata storage
- Analytics data tracking
- Session and token management

## Success Metrics

### Platform Adoption
- Number of registered users
- Passport generation rate
- User retention and engagement
- Employer adoption rate

### User Success
- Job placement rate improvement
- Skill development metrics
- User satisfaction scores
- Portfolio completion rates

### Platform Performance
- Page load times
- API response times
- User session duration
- Feature adoption rates

## Risk Mitigation

### Technical Risks
- API rate limiting and reliability
- Scalability of PDF generation
- Data privacy and security compliance
- Third-party service dependencies

### Business Risks
- Market adoption and user acquisition
- Competition from established platforms
- Employer acceptance and validation
- Regulatory compliance requirements

---

*This plan is designed to build a comprehensive, user-centered platform that transforms how workplace skills are verified and presented, moving from claims-based to proof-based credentialing.*