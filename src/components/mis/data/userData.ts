import type {
  Candidate,
  CompanyRecruiter,
  InstitutionRecruiter,
  StartupRecruiter,
} from '../types';

export const mockCandidates: Candidate[] = [
  { sNo: 1, date: '2026-08-25', customerName: 'Rahul Sharma', emailId: 'rahul.sharma@gmail.com', whatsAppNumber: '+91 9876543210', expFresher: 'Experienced', subscription: 'Premium', location: 'Bangalore, India' },
  { sNo: 2, date: '2026-08-25', customerName: 'Priya Patel', emailId: 'priya.patel@yahoo.com', whatsAppNumber: '+91 9812345678', expFresher: 'Fresher', subscription: 'Free', location: 'Mumbai, India' },
  { sNo: 3, date: '2026-08-26', customerName: 'Ananya Verma', emailId: 'ananya.v@outlook.com', whatsAppNumber: '+91 9988776655', expFresher: 'Experienced', subscription: 'Premium', location: 'Delhi, India' },
  { sNo: 4, date: '2026-08-26', customerName: 'Vikram Singh', emailId: 'vikram.singh@gmail.com', whatsAppNumber: '+91 9765432109', expFresher: 'Fresher', subscription: 'Free', location: 'Hyderabad, India' },
  { sNo: 5, date: '2026-08-27', customerName: 'Neha Gupta', emailId: 'neha.gupta@hotm.com', whatsAppNumber: '+91 9654321098', expFresher: 'Experienced', subscription: 'Premium', location: 'Pune, India' },
  { sNo: 6, date: '2026-08-27', customerName: 'Rohan Das', emailId: 'rohan.das@gmail.com', whatsAppNumber: '+91 9543210987', expFresher: 'Fresher', subscription: 'Free', location: 'Kolkata, India' },
];

export const mockCompanyRecruiters: CompanyRecruiter[] = [
  { sNo: 1, date: '2026-08-20', companyName: 'TechCorp Solutions', name: 'TechCorp Solutions Pvt Ltd', location: 'Bangalore, India', nameOfRep: 'Amit Kumar', emailId: 'hr@techcorp.com', mobileNo: '+91 9876500001', url: 'https://techcorp.com', subscription: 'Premium' },
  { sNo: 2, date: '2026-08-22', companyName: 'Innovate X', name: 'Innovate X Systems', location: 'Mumbai, India', nameOfRep: 'Sarah Jenkins', emailId: 'careers@innovatex.io', mobileNo: '+91 9876500002', url: 'https://innovatex.io', subscription: 'Free' },
  { sNo: 3, date: '2026-08-24', companyName: 'Global Logistics Inc', name: 'Global Logistics Enterprises', location: 'Gurgaon, India', nameOfRep: 'Rajesh Sharma', emailId: 'talent@globallogistics.com', mobileNo: '+91 9876500003', url: 'https://globallogistics.com', subscription: 'Premium' },
  { sNo: 4, date: '2026-08-26', companyName: 'Apex Systems', name: 'Apex Systems India Ltd', location: 'Hyderabad, India', nameOfRep: 'Elena Rostova', emailId: 'recruitment@apexsystems.in', mobileNo: '+91 9876500004', url: 'https://apexsystems.in', subscription: 'Premium' },
];

export const mockInstitutionRecruiters: InstitutionRecruiter[] = [
  { sNo: 1, date: '2026-08-15', institutionName: 'IIT Bombay', name: 'Indian Institute of Technology Bombay', location: 'Mumbai, India', nameOfRep: 'Dr. R. K. Sharma', emailId: 'placements@iitb.ac.in', mobileNo: '+91 9876500021', url: 'https://iitb.ac.in', subscription: 'Premium' },
  { sNo: 2, date: '2026-08-18', institutionName: 'Delhi University', name: 'University of Delhi Placement Cell', location: 'New Delhi, India', nameOfRep: 'Prof. Sunita Mehta', emailId: 'placement@du.ac.in', mobileNo: '+91 9876500022', url: 'https://du.ac.in', subscription: 'Free' },
  { sNo: 3, date: '2026-08-21', institutionName: 'BITS Pilani', name: 'Birla Institute of Technology and Science', location: 'Pilani, India', nameOfRep: 'Dr. A. P. Varma', emailId: 'placements@pilani.bits-pilani.ac.in', mobileNo: '+91 9876500023', url: 'https://bits-pilani.ac.in', subscription: 'Premium' },
  { sNo: 4, date: '2026-08-25', institutionName: 'VIT University', name: 'Vellore Institute of Technology', location: 'Vellore, India', nameOfRep: 'Dr. Meenakshi Sundaram', emailId: 'placement@vit.ac.in', mobileNo: '+91 9876500024', url: 'https://vit.ac.in', subscription: 'Free' },
];

export const mockStartupRecruiters: StartupRecruiter[] = [
  { sNo: 1, date: '2026-08-19', startupName: 'NexusAI Labs', name: 'NexusAI Technologies Pvt Ltd', location: 'Bangalore, India', nameOfRep: 'Sidharth Rao', emailId: 'founder@nexusai.io', mobileNo: '+91 9876500041', url: 'https://nexusai.io', subscription: 'Premium' },
  { sNo: 2, date: '2026-08-22', startupName: 'FinFlow Tech', name: 'FinFlow Financial Solutions', location: 'Hyderabad, India', nameOfRep: 'Kavita Reddy', emailId: 'jobs@finflow.tech', mobileNo: '+91 9876500042', url: 'https://finflow.tech', subscription: 'Free' },
  { sNo: 3, date: '2026-08-24', startupName: 'HealthPlus Digital', name: 'HealthPlus Innovations Ltd', location: 'Pune, India', nameOfRep: 'Dr. Rohan Joshi', emailId: 'careers@healthplus.digital', mobileNo: '+91 9876500043', url: 'https://healthplus.digital', subscription: 'Premium' },
  { sNo: 4, date: '2026-08-26', startupName: 'EcoDrive Mobility', name: 'EcoDrive EV Systems', location: 'Noida, India', nameOfRep: 'Varun Aggarwal', emailId: 'hiring@ecodrive.co.in', mobileNo: '+91 9876500044', url: 'https://ecodrive.co.in', subscription: 'Free' },
];

export const mockTotalStaff = [
  { sNo: 1, date: '2026-01-15', employeeName: 'Aarav Mehta', emailId: 'aarav.m@letgetin.com', mobileNo: '+91 9876511101', designation: 'Senior Software Engineer', department: 'Engineering', location: 'Bangalore', employmentType: 'Full Time', status: 'Active' },
  { sNo: 2, date: '2026-02-01', employeeName: 'Sneha Roy', emailId: 'sneha.r@letgetin.com', mobileNo: '+91 9876511102', designation: 'Product Designer', department: 'Design', location: 'Mumbai', employmentType: 'Full Time', status: 'Active' },
  { sNo: 3, date: '2026-03-10', employeeName: 'Karan Shah', emailId: 'karan.s@letgetin.com', mobileNo: '+91 9876511103', designation: 'Marketing Executive', department: 'Marketing', location: 'Delhi', employmentType: 'Contract', status: 'Active' },
  { sNo: 4, date: '2026-04-05', employeeName: 'Riya Sen', emailId: 'riya.sen@letgetin.com', mobileNo: '+91 9876511104', designation: 'HR Specialist', department: 'Human Resources', location: 'Pune', employmentType: 'Part Time', status: 'Inactive' },
  { sNo: 5, date: '2026-06-01', employeeName: 'Devansh Nair', emailId: 'devansh.n@letgetin.com', mobileNo: '+91 9876511105', designation: 'Data Analyst Intern', department: 'Analytics', location: 'Bangalore', employmentType: 'Intern', status: 'Active' },
];

export const mockOpenPositions = [
  { sNo: 1, date: '2026-08-10', jobTitle: 'Senior Frontend Developer', department: 'Engineering', location: 'Bangalore', employmentType: 'Full Time', experience: '4-6 Years', openings: 3, status: 'Open' },
  { sNo: 2, date: '2026-08-12', jobTitle: 'DevOps Engineer', department: 'Infrastructure', location: 'Remote', employmentType: 'Contract', experience: '3-5 Years', openings: 2, status: 'Open' },
  { sNo: 3, date: '2026-08-15', jobTitle: 'UI/UX Design Intern', department: 'Design', location: 'Mumbai', employmentType: 'Internship', experience: '0-1 Years', openings: 4, status: 'Open' },
  { sNo: 4, date: '2026-08-01', jobTitle: 'Account Executive', department: 'Sales', location: 'Delhi', employmentType: 'Part Time', experience: '2-4 Years', openings: 1, status: 'Closed' },
];
