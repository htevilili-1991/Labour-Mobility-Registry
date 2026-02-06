# **Vanuatu Labour Mobility Registry**

The **Vanuatu Labour Registry** is a sophisticated, full-stack web application engineered to streamline labour movement data management for the Vanuatu government. Leveraging an isomorphic **React JS** frontend with **Inertia.js** and a robust **Laravel** backend, it delivers a seamless, single-page application (SPA) experience with server-side hydration. The application empowers users with real-time data querying, dynamic record manipulation, and a responsive, modern interface, underpinned by cutting-edge technologies and best practices.

## **Table of Contents**
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Architecture](#project-architecture)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## **Features**

### Core Registry Management
- **Real-Time Global Search**: Implements a reactive, client-side filtering mechanism using **`@tanstack/react-table`**, enabling instant querying across 8 displayed columns (`surname`, `given_name`, `dob`, `sex`, `travel_date`, `direction`, `travel_reason`, `destination_coming_from`).
- **Dynamic Data Grid**: A sortable, interactive table with row-level navigation to detailed views, powered by **React JS** and **TypeScript** for type-safe data rendering.
- **Comprehensive Record Management**: Facilitates CRUD operations with a form-driven interface for editing all 16 registry fields, featuring reactive state management and conditional UI updates via **Inertia.js**.
- **Responsive UI**: Crafted with **Tailwind CSS** for a pixel-perfect, mobile-optimized design adhering to modern UX principles.
- **Secure Authentication**: Integrates **Laravel**'s authentication middleware with session-based security and CSRF protection for robust access control.
- **Error Resilience**: Employs comprehensive error handling with custom error pages and **Laravel** logging for diagnostics, ensuring operational stability.

### Advanced Data Upload & Validation
- **Wizard-Style CSV Upload**: Multi-step guided flow with 4 stages (Select File → Validate Data → Map Fields → Create Batch) featuring progress indicators and step navigation.
- **Auto-Save Progress**: Wizard progress automatically saved to localStorage and restored on page reload, preventing data loss during multi-step processes.
- **Drag-and-Drop Interface**: Intuitive CSV file upload with visual drag zone and hover states for enhanced user experience.
- **Real-Time Data Validation**: Comprehensive field validation including passport format regex, age calculation from DOB, logical date checks, and duplicate detection within CSV files.
- **Smart Error Reporting**: Detailed inline error messages with row numbers, specific field issues, and suggested fixes for data quality assurance.
- **Intelligent Defaults**: Auto-filled batch dates (current month), smart batch name suggestions, and pre-populated form fields to reduce manual data entry.

### Batch Management System
- **Multi-Select Operations**: Checkbox-based selection system with "Select All" functionality for bulk registry entry management.
- **Bulk Actions**: Add multiple registry entries to draft batches in a single operation with visual selection indicators and action toolbar.
- **Batch Workflow Management**: Complete batch lifecycle management (draft → submitted → under_review → approved/rejected) with role-based permissions.
- **Email Notifications**: Automatic email notifications to verification staff upon batch submission with detailed batch information and direct links.
- **Batch Analytics**: Real-time record counting, batch filtering by scheme/type/status, and comprehensive batch tracking.

### User Experience & Accessibility
- **Dark/Light Theme System**: Complete theming support with light, dark, and system preference modes using custom appearance management.
- **Responsive Design**: Mobile-optimized interface with adaptive layouts and touch-friendly controls.
- **Progress Indicators**: Visual feedback for all async operations including uploads, validations, and batch processing.
- **Keyboard Navigation**: Full keyboard accessibility support for power users and accessibility compliance.

### Administrative & Verification Features
- **Role-Based Access Control**: Granular permission system with role management for different user types (VBoS, Labour Department, Admin).
- **Verification Workflow**: Dedicated verification interface for Labour Department staff with audit trails and approval/rejection capabilities.
- **Audit System**: Comprehensive audit logging for all registry changes with user tracking and timestamps.
- **Reports Dashboard**: Advanced analytics and reporting module with verification, compliance, and performance reports.
- **Real-Time Analytics**: Live data visualization and statistics for monitoring registry operations and trends.

## **Technology Stack**
- **Backend Framework**: **Laravel** 11, a PHP framework with Eloquent ORM for seamless database interactions and RESTful API routing.
- **Frontend Library**: **React JS** 18, utilizing functional components and hooks for reactive UI development.
- **Server-Side Rendering Bridge**: **Inertia.js**, enabling SPA-like experiences with server-driven rendering, eliminating traditional API overhead.
- **Type Safety**: **TypeScript**, enforcing static typing for maintainable and scalable frontend code.
- **Styling**: **Tailwind CSS**, a utility-first CSS framework for rapid, responsive design.
- **Data Table Engine**: **`@tanstack/react-table` v8**, providing advanced table functionalities like sorting and filtering.
- **Build Orchestration**: **Vite** 6.2.0, a next-generation bundler for lightning-fast development and production builds.
- **Database**: **MySQL**, managed via **Laravel** migrations for schema consistency.
- **Environment**: **XAMPP**, hosting **Apache** and **MySQL** for local development on Windows.

## **Prerequisites**
- **PHP**: 8.2 or higher
- **Composer**: Latest version for dependency management
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **MySQL**: 8.0 or higher
- **XAMPP**: Configured with **Apache** and **MySQL**
- **Git**: For repository cloning

## **Installation**
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/vanuatu-labour-registry.git
   cd vanuatu-labour-registry
   ```

2. **Install PHP Dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with **MySQL** credentials:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=vanuatu_labour_registry
     DB_USERNAME=root
     DB_PASSWORD=
     ```
   - Generate **Laravel** application key:
     ```bash
     php artisan key:generate
     ```

5. **Run Migrations**
   ```bash
   php artisan migrate
   ```

6. **Seed Test Data (Optional)**
   ```bash
   php artisan tinker
   ```
   ```php
   use App\Models\Registry;
   Registry::create([
       'surname' => 'Doe',
       'given_name' => 'John',
       'nationality' => 'Vanuatu',
       'country_of_residence' => 'Vanuatu',
       'document_type' => 'Passport',
       'document_no' => '123456',
       'dob' => '1990-01-01',
       'age' => 35,
       'sex' => 'Male',
       'travel_date' => '2025-05-16',
       'direction' => 'Inbound',
       'accommodation_address' => '123 Main St',
       'note' => null,
       'travel_reason' => 'Work',
       'border_post' => 'Port Vila',
       'destination_coming_from' => 'Australia',
   ]);
   Registry::create([
       'surname' => 'Smith',
       'given_name' => 'Jane',
       'nationality' => 'Australia',
       'country_of_residence' => 'Australia',
       'document_type' => 'Passport',
       'document_no' => '789012',
       'dob' => '1985-06-15',
       'age' => 40,
       'sex' => 'Female',
       'travel_date' => '2025-05-17',
       'direction' => 'Outbound',
       'accommodation_address' => '456 Ocean Rd',
       'note' => 'Business trip',
       'travel_reason' => 'Business',
       'border_post' => 'Port Vila',
       'destination_coming_from' => 'New Zealand',
   ]);
   exit;
   ```

7. **Build Assets**
   ```bash
   npm run build
   ```

8. **Start Servers**
   - **Laravel**:
     ```bash
     php artisan serve
     ```
   - **Vite**:
     ```bash
     npm run dev
     ```

9. **Access the Application**
   - Navigate to `http://localhost:8000`.
   - Register or log in to access the dashboard and registry.

## **Usage**

### Registry Data Management
1. **Query Registry Data**
   - Access `/registry` via the **AppSidebar.tsx** navigation ("View Data").
   - Utilize the instant search input, powered by **`@tanstack/react-table`**, to filter records (e.g., `Doe`, `2025-05`).
   - Sort columns by clicking headers (e.g., `Surname`) for dynamic data ordering.
   - Click rows to navigate to `/registry/{id}` for detailed views.

2. **Manage Individual Records**
   - On `/registry/{id}`, edit all 16 fields using a **React JS** form with **Inertia.js** form handling.
   - Changes trigger a reactive `Update` button, leveraging **TypeScript** for type-safe state management.
   - Submit updates via **Inertia.js** `PUT` requests to **Laravel**'s `RegistryController`.
   - Use the `Back` button to return to `/registry`.

### CSV Data Upload & Batch Processing
3. **Upload CSV Data via Wizard**
   - Navigate to `/registry/upload-wizard` to access the guided upload flow.
   - **Step 1**: Select CSV file using drag-and-drop or file picker.
   - **Step 2**: Review real-time validation results with detailed error reporting.
   - **Step 3**: Map CSV columns to registry fields (auto-mapped when possible).
   - **Step 4**: Create or select a batch with auto-filled dates and smart naming.
   - Progress is automatically saved and restored if you navigate away.

4. **Batch Management**
   - View all batches at `/batches` with filtering by scheme, type, and status.
   - Create new batches at `/batches/create` with intelligent defaults.
   - Use multi-select checkboxes on `/registry` to bulk-add entries to existing batches.
   - Submit batches for verification with automatic email notifications to staff.
   - Track batch progress through draft → submitted → under_review → approved/rejected stages.

### Verification & Administration
5. **Verification Workflow (Labour Department)**
   - Access verification dashboard at `/verification/dashboard`.
   - Review submitted batches with detailed registry entry validation.
   - Approve or reject batches with audit trail logging.
   - View batch audit history at `/verification/{batch}/audit`.

6. **Administrative Functions**
   - Manage user roles and permissions via `/admin/roles` and `/admin/permissions`.
   - Generate reports at `/reports` including verification, compliance, and performance analytics.
   - View audit logs at `/audits` for complete system activity tracking.
   - Monitor real-time analytics and statistics on the main dashboard.

### User Interface Features
7. **Theme & Appearance**
   - Toggle between light, dark, and system themes using the appearance selector.
   - Theme preference is automatically saved and restored across sessions.
   - All interfaces are fully responsive and mobile-optimized.

8. **Bulk Operations**
   - Select multiple registry entries using checkboxes in the main registry table.
   - Use "Select All" to select all visible entries.
   - Perform bulk actions like adding entries to batches or exporting selected data.

9. **Diagnostics**
   - **UI Issues**: If the app becomes unresponsive post-update, inspect the browser console (F12) and `storage/logs/laravel.log` for **Laravel** or **React JS** errors.
   - **Database Errors**: Validate **MySQL** migrations and `.env` configuration.
   - **Build Failures**: Clear caches and rebuild:
     ```bash
     php artisan cache:clear
     php artisan config:clear
     php artisan route:clear
     rm -rf node_modules/.vite
     rm -rf public/build
     npm run build
     ```

## **Project Architecture**
```
vanuatu-labour-registry/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── RegistryController.php
│   │   │   ├── RegistryBatchController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── VerificationController.php
│   │   │   ├── ReportsController.php
│   │   │   └── AuditController.php
│   │   └── Middleware/
│   │       └── HandleAppearance.php
│   └── Models/
│       ├── Registry.php
│       └── RegistryBatch.php
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── app-content.tsx
│   │   │   └── appearance-tabs.tsx
│   │   ├── hooks/
│   │   │   └── use-appearance.tsx
│   │   ├── layouts/
│   │   │   ├── app-layout.tsx
│   │   │   ├── auth/
│   │   │   │   ├── auth-card-layout.tsx
│   │   │   │   └── auth-split-layout.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── registry/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── show.tsx
│   │   │   │   ├── upload.tsx
│   │   │   │   └── upload-wizard.tsx
│   │   │   ├── batches/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── show.tsx
│   │   │   │   └── create.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── auth/
│   │   │   │   └── login.tsx
│   │   │   └── Error.tsx
│   │   ├── types/index.ts
│   │   └── app.tsx
│   ├── css/app.css
│   └── views/app.blade.php
├── routes/
│   ├── web.php
│   ├── auth.php
│   └── settings.php
├── database/
│   └── migrations/
├── .env.example
├── composer.json
├── package.json
├── vite.config.ts
├── README.md
└── FEATURE_IMPLEMENTATION_STATUS.md
```

**Key Components:**

**Backend Controllers:**
- `RegistryController.php`: Handles CRUD operations, CSV upload wizard, and validation logic.
- `RegistryBatchController.php`: Manages batch lifecycle, email notifications, and bulk operations.
- `VerificationController.php`: Oversees verification workflow for Labour Department staff.
- `ReportsController.php`: Generates analytics and compliance reports.
- `DashboardController.php`: Provides real-time statistics and dashboard data.

**Frontend Pages:**
- `upload-wizard.tsx`: Multi-step CSV upload with auto-save, drag-drop, and real-time validation.
- `index.tsx` (registry): Enhanced table with multi-select checkboxes and bulk actions.
- `batches/`: Complete batch management interface with filtering and workflow tracking.
- `dashboard.tsx`: Real-time analytics and statistics visualization.

**UI Components:**
- `appearance-tabs.tsx`: Theme switching interface (light/dark/system).
- `use-appearance.tsx`: Custom hook for theme state management.
- Enhanced layouts with responsive design and accessibility features.

## **Database Schema**
The `registry` table comprises 16 columns, managed via **Laravel** migrations:

```sql
CREATE TABLE registry (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    surname VARCHAR(255) NOT NULL,
    given_name VARCHAR(255) NOT NULL,
    nationality VARCHAR(255) NOT NULL,
    country_of_residence VARCHAR(255) NOT NULL,
    document_type VARCHAR(255) NOT NULL,
    document_no VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    age INT NOT NULL,
    sex VARCHAR(50) NOT NULL,
    travel_date DATE NOT NULL,
    direction VARCHAR(255) NOT NULL,
    accommodation_address VARCHAR(255) NOT NULL,
    note TEXT NULL,
    travel_reason VARCHAR(255) NOT NULL,
    border_post VARCHAR(255) NOT NULL,
    destination_coming_from VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Note**: Actual registry data is not included in this repository to ensure privacy and compliance with data protection standards. To populate the database with dummy data for development and testing, execute the **Laravel Tinker** commands provided in the [Installation](#installation) section under "Seed Test Data."

## **Contributing**
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes with descriptive messages:
   ```bash
   git commit -m "Implement your feature with Laravel and React JS"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Submit a pull request via GitHub.

Contributions must adhere to **PSR-12** for **Laravel** (PHP) and **ESLint** with **TypeScript** for **React JS**. Include unit tests leveraging **PHPUnit** or **Vitest** where applicable.

## **License**
This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

## **Screenshots** 

NOTE: All data on these screenshots are dummy data

### Core Interface
**Login Screen**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/c70d1e09-8b51-44c9-9f0c-5c9b19aa7417" />

**Dashboard with Real-Time Analytics**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/bb53f0e3-6102-45fa-a6c0-1c75f0368052" />

### Registry Management
**Registry Data Table with Multi-Select**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/669251d4-8152-4bf4-8283-7911aa0447e9" />

**Individual Record Edit Form**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/baebcb7e-3128-4bec-8704-ca2e27addfa8" />

### CSV Upload Wizard
**Step 1: File Selection with Drag-and-Drop**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/a5b9cd43-c5d6-4da6-9a0c-dba75799ef41" />

**Step 2: Real-Time Validation Results**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/792f95ca-ab46-4aa6-9cf1-3fcaf6f74462" />
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/3ff22252-47bf-48ea-bafb-59e2165baab1" />
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/2b1e90ae-dac9-4a21-9af7-f94ccae9b874" />

**Step 3: Field Mapping Interface**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/1a37da3e-ffa1-407c-a8df-b94a7a1bd62e" />

**Step 4: Batch Creation with Smart Defaults**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/2952de6c-3d78-4440-91e6-6becdf59f18c" />

### Batch Management
**Batch List with Filtering**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/8ebaa6c7-b264-4ce4-8af8-aae136d2d447" />

**Batch Detail View with Registry Entries**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/ca1b1c68-f1ca-4050-8c0e-928191409b2d" />

**Bulk Operations Interface**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/ec280247-d1ae-4700-8ffe-7b8945534479" />

### Verification & Administration
**Verification Dashboard**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/281678dc-d060-4df0-ac67-e554d21d7f54" />
<img width="1870" height="955" alt="User Management" src="https://github.com/user-attachments/assets/a7efe7df-a2c1-4672-8484-1ec1ba5c3cd6" />
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/518eb428-49c5-433e-816c-44349fcf6b78" />
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/df82ebc6-756e-46d6-937d-97ece6f3d74c" />

**User Management Interface**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/cab3238b-da2e-49b9-8765-54b2b8ebb669" />

**Roles & Permissions**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/0aef4108-1a7c-4a28-80ec-0d149e727796" />

**Reports Analytics**
<img width="1919" height="1127" alt="image" src="https://github.com/user-attachments/assets/4939b5ef-f90e-41ce-a44e-4c364d13e9a4" />

<!--### Theme & Appearance-->
<!--**Light Theme Interface**-->
<!-- Add light theme screenshot here -->

<!--**Dark Theme Interface**-->
<!-- Add dark theme screenshot here -->

## **Contact**
For support or inquiries, contact the **Vanuatu Labour Registry** development team:
- **Email**: htevilili@vanuatu.gov.vu

---

*Engineered for the **Vanuatu Bureau of Statistics** with **Laravel**, **React JS**, May 2025*
