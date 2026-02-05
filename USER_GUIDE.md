# Labour Mobility Registry - Complete User Guide

## 📋 Table of Contents
1. [Navigation & Menu Structure](#navigation--menu-structure)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Complete Workflow Overview](#complete-workflow-overview)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Features & Functionalities](#features--functionalities)

---

## 🧭 Navigation & Menu Structure

### Main Sidebar Navigation
```
🏠 Dashboard          → /dashboard
📄 Registry          → /registry
📤 Upload Data       → /registry/upload
📦 Batches           → /batches
🔍 Verification     → /verification
📊 Reports          → /reports
📋 Audit Logs        → /audits
```

### Sub-Menus & Quick Actions
- **Registry**: Individual entries, search, export
- **Batches**: Create, edit, submit, manage batches
- **Verification**: Dashboard, batch verification, approval workflow
- **Reports**: Main dashboard, verification, compliance, performance reports

---

## 👥 User Roles & Permissions

### VBoS Data Entry Staff
**Permissions**: `registry.*`, `batches.create`, `batches.edit`, `batches.submit`
**Can Access**:
- ✅ Registry entries and CSV upload
- ✅ Batch creation and management
- ✅ Submit batches for verification
- ❌ Cannot verify or approve batches

### Labour Department Verification Staff
**Permissions**: `batches.verify`, `batches.audit`, `reports.view`
**Can Access**:
- ✅ Verification dashboard and queue
- ✅ Batch verification and audit trail
- ✅ View all reports
- ❌ Cannot create or edit batches
- ❌ Cannot approve or reject batches

### Labour Department Management
**Permissions**: `batches.approve`, `batches.reject`, `reports.*`
**Can Access**:
- ✅ All verification features
- ✅ Batch approval and rejection
- ✅ All reports and analytics
- ❌ Cannot create or edit batches

### System Administrator
**Permissions**: `*` (all permissions)
**Can Access**:
- ✅ All features and functionalities
- ✅ User management and role assignment
- ✅ System configuration

---

## 🔄 Complete Workflow Overview

```
VBoS Staff Upload → Create Batches → Submit for Verification → Labour Verification → Labour Approval/Rejection
```

### Workflow States
1. **Data Entry** → CSV upload → Registry entries
2. **Batch Creation** → Group entries → Draft batches
3. **Submission** → Submit batches → Verification queue
4. **Verification** → Review → Verify/Return
5. **Approval** → Final review → Approve/Reject
6. **Locking** → Approved batches → Immutable data

---

## 📖 Step-by-Step Guide

### Step 1: VBoS Data Entry - Upload Monthly Data

#### 1.1 Access Upload Page
```
Navigation: Upload Data → /registry/upload
```

#### 1.2 Download Template
1. Click "CSV template" link
2. Download `registry-template.csv`
3. Template includes required fields:
   - surname, given_name, nationality
   - national_id_number, document_type, document_no
   - dob, age, sex, travel_date, direction
   - accommodation_address, travel_reason
   - border_post, destination_coming_from

#### 1.3 Prepare CSV File
- Follow template format exactly
- Ensure all required fields are filled
- Check data quality and consistency
- Remove duplicate document numbers

#### 1.4 Upload CSV
1. Click "Choose File" button
2. Select prepared CSV file
3. Click "Upload CSV"
4. System validates and imports data
5. Success message shows records imported

### Step 2: VBoS Data Entry - Create Registry Batches

#### 2.1 Access Batches Page
```
Navigation: Batches → /batches
```

#### 2.2 Create New Batch
1. Click "Create Batch" button
2. Fill batch information:
   - **Batch Name**: e.g., "January 2026 RSE Departures"
   - **Batch Type**: inbound, outbound, earnings, returns
   - **Scheme**: RSE, SWP, PALM
   - **Period Start/End**: Coverage dates
   - **Description**: Detailed batch description

#### 2.3 Add Registry Entries
1. Click "Add Registry Entries"
2. Search and select individual entries
3. Review batch composition
4. Click "Save Batch"

#### 2.4 Submit for Verification
1. Review batch details
2. Ensure all required data is complete
3. Click "Submit Batch"
4. Status changes: Draft → Submitted
5. Batch appears in verification queue

### Step 3: Labour Department - Verification Process

#### 3.1 Access Verification Dashboard
```
Navigation: Verification → /verification/dashboard
```

#### 3.2 Review Pending Queue
1. View "Pending Verification" section
2. Prioritize by submission date
3. Click "Verify" for next batch

#### 3.3 Detailed Batch Verification
**Page**: `/verification/{batch-id}`

**Verification Checklist**:
1. **Data Completeness Check**
   - All required fields present
   - Document numbers valid
   - Dates properly formatted

2. **Data Quality Review**
   - Names match documents
   - Nationalities consistent
   - Travel dates logical

3. **Compliance Verification**
   - Scheme requirements met
   - Border post regulations followed
   - Accommodation addresses valid

4. **Discrepancy Tracking**
   - Click "Add Discrepancy" for issues
   - Select severity: Low/Medium/High
   - Add detailed notes
   - Mark as resolved if applicable

#### 3.4 Verification Actions
**Options**:
- **Verify**: Mark batch as verified → Status: Under Review
- **Return**: Send back to VBoS with notes → Status: Draft
- **Save Progress**: Save checklist progress

#### 3.5 Complete Verification
1. Ensure checklist is 100% complete
2. Add verification notes
3. Click "Mark as Verified"
4. Batch moves to approval queue

### Step 4: Labour Department - Approval/Rejection Process

#### 4.1 Access Verification Queue
```
Navigation: Verification → /verification
Filter: Status = "Under Review"
```

#### 4.2 Review Verified Batches
1. Click "View" on verified batch
2. Review verification quality
3. Check all discrepancies resolved
4. Verify compliance requirements

#### 4.3 Approval Decision
**Approve Batch**:
1. Click "Approve" button
2. Add approval notes (optional)
3. Confirm approval
4. **Result**: Status: Approved (locked, immutable)

**Reject Batch**:
1. Click "Reject" button
2. Select rejection reason
3. Add detailed explanation
4. **Result**: Status: Rejected (returns to VBoS)

#### 4.4 Final Status Outcomes
- **Approved**: Data locked, compliance achieved
- **Rejected**: Returns to VBoS for corrections
- **Audit Trail**: All actions logged with user, timestamp, IP

---

## 🎯 Features & Functionalities

### Registry Management
- **Individual Entry Management**: CRUD operations for registry entries
- **CSV Upload**: Bulk data import with validation
- **Search & Filter**: Advanced search by multiple criteria
- **Export**: Export data in CSV/Excel formats
- **Audit Log**: Track all entry changes

### Batch Management
- **Batch Creation**: Group related entries
- **Status Tracking**: Real-time status updates
- **Workflow Management**: Draft → Submit → Verify → Approve
- **Quality Control**: Data validation and completeness checks
- **Batch Statistics**: Record counts and metrics

### Verification System
- **Verification Dashboard**: Overview and queue management
- **Checklist System**: Standardized verification process
- **Discrepancy Tracking**: Issue identification and resolution
- **Audit Trail**: Complete verification history
- **Performance Metrics**: Verification times and quality scores

### Reporting & Analytics
- **Main Dashboard**: Overview statistics and trends
- **Verification Report**: Detailed verification analytics
- **Compliance Report**: Data quality and compliance metrics
- **Performance Report**: Efficiency and bottleneck analysis
- **Export Functions**: Download reports in various formats

### User Management
- **Role-Based Access**: Different permissions for different roles
- **Permission System**: Granular access control
- **User Profiles**: User information and role assignment
- **Activity Tracking**: User performance metrics

### System Features
- **Real-Time Updates**: Live status changes
- **Notifications**: System alerts and updates
- **Responsive Design**: Works on all devices
- **Data Security**: Encrypted data storage
- **Backup & Recovery**: Data protection measures

---

## 🔧 Advanced Features

### API Integration
- **RESTful API**: Complete API for external integrations
- **Webhooks**: Real-time notifications
- **Data Export**: API endpoints for data extraction
- **Authentication**: Secure API access

### Automation
- **Data Validation**: Automatic quality checks
- **Duplicate Detection**: Prevent data redundancy
- **Compliance Checks**: Automatic rule validation
- **Report Generation**: Automated report creation

### Monitoring
- **System Health**: Performance monitoring
- **User Activity**: Track system usage
- **Error Logging**: Comprehensive error tracking
- **Analytics Dashboard**: Usage statistics

---

## 📚 Quick Reference

### Common Tasks
1. **Upload Monthly Data**: Registry → Upload Data → Select CSV → Upload
2. **Create Batch**: Batches → Create Batch → Fill details → Add entries → Submit
3. **Verify Batch**: Verification → Dashboard → Verify → Complete checklist → Mark verified
4. **Approve Batch**: Verification → Find verified batch → Review → Approve/Reject
5. **View Reports**: Reports → Select report type → View analytics → Export if needed

### Status Meanings
- **Draft**: Being created/edited by VBoS
- **Submitted**: Ready for verification
- **Under Review**: Currently being verified
- **Approved**: Final approval, data locked
- **Rejected**: Returned for corrections

### Troubleshooting
- **Upload Errors**: Check CSV format and required fields
- **Verification Issues**: Ensure checklist completion
- **Permission Problems**: Contact system administrator
- **Data Quality**: Use validation reports

---

## 🚀 Getting Started

### First-Time Users
1. **VBoS Staff**: Start with CSV upload → Create batches → Submit
2. **Labour Staff**: Check verification queue → Review batches → Verify/approve
3. **Admin**: Set up users → Assign permissions → Monitor system

### Daily Operations
1. **VBoS**: Upload monthly data → Create batches → Submit
2. **Labour**: Verify submitted batches → Approve/reject
3. **Admin**: Monitor system → Review reports → Manage users

### Best Practices
- **Data Quality**: Always validate CSV before upload
- **Batch Organization**: Use clear naming conventions
- **Documentation**: Keep detailed notes in verification
- **Regular Reviews**: Check reports and analytics
- **Security**: Protect login credentials and data

This comprehensive system provides complete workflow management for Vanuatu's Labour Mobility Registry, ensuring data integrity, compliance, and efficient processing of all labour mobility schemes.
