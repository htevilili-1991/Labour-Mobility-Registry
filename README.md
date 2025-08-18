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
- **Real-Time Global Search**: Implements a reactive, client-side filtering mechanism using **`@tanstack/react-table`**, enabling instant querying across 8 displayed columns (`surname`, `given_name`, `dob`, `sex`, `travel_date`, `direction`, `travel_reason`, `destination_coming_from`).
- **Dynamic Data Grid**: A sortable, interactive table with row-level navigation to detailed views, powered by **React JS** and **TypeScript** for type-safe data rendering.
- **Comprehensive Record Management**: Facilitates CRUD operations with a form-driven interface for editing all 16 registry fields, featuring reactive state management and conditional UI updates via **Inertia.js**.
- **Responsive UI**: Crafted with **Tailwind CSS** for a pixel-perfect, mobile-optimized design adhering to modern UX principles.
- **Secure Authentication**: Integrates **Laravel**’s authentication middleware with session-based security and CSRF protection for robust access control.
- **Error Resilience**: Employs comprehensive error handling with custom error pages and **Laravel** logging for diagnostics, ensuring operational stability.

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
1. **Query Registry Data**
   - Access `/registry` via the **AppSidebar.tsx** navigation ("View Data").
   - Utilize the instant search input, powered by **`@tanstack/react-table`**, to filter records (e.g., `Doe`, `2025-05`).
   - Sort columns by clicking headers (e.g., `Surname`) for dynamic data ordering.
   - Click rows to navigate to `/registry/{id}` for detailed views.

2. **Manage Records**
   - On `/registry/{id}`, edit all 16 fields using a **React JS** form with **Inertia.js** form handling.
   - Changes trigger a reactive `Update` button, leveraging **TypeScript** for type-safe state management.
   - Submit updates via **Inertia.js** `PUT` requests to **Laravel**’s `RegistryController`.
   - Use the `Back` button to return to `/registry`.

3. **Diagnostics**
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
│   │   └── Controllers/RegistryController.php
│   └── Models/Registry.php
├── resources/
│   ├── js/
│   │   ├── Components/AppSidebar.tsx
│   │   ├── layouts/app-layout.tsx
│   │   ├── pages/
│   │   │   ├── registry/
│   │   │   │   ├── index.tsx
│   │   │   │   └── show.tsx
│   │   │   └── Error.tsx
│   │   ├── types/index.ts
│   │   └── app.tsx
│   ├── css/app.css
│   └── views/app.blade.php
├── routes/web.php
├── database/
│   └── migrations/
├── .env.example
├── composer.json
├── package.json
├── vite.config.ts
└── README.md
```

- `RegistryController.php`: Orchestrates CRUD operations with **Laravel**’s Eloquent ORM and **Inertia.js** responses.
- `index.tsx`: Renders a reactive, sortable table with instant search using **React JS** and **`@tanstack/react-table`**.
- `show.tsx`: Provides a type-safe form for editing 16 fields, integrated with **Inertia.js** for seamless server communication.
- `AppSidebar.tsx`: Implements navigation with **React JS** components and **Inertia.js** routing.

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
Login Screen
<img width="1787" height="895" alt="image" src="https://github.com/user-attachments/assets/15d686ca-c513-4ca4-b24b-2d9b58b7b52b" />

Dashboard
<img width="1870" height="955" alt="Screenshot From 2025-08-18 11-03-48" src="https://github.com/user-attachments/assets/296a19cc-898f-41bb-b9b9-ba645250516a" />

View/edit/delete Registry Data
<img width="1870" height="955" alt="Screenshot From 2025-08-18 11-11-06" src="https://github.com/user-attachments/assets/d88a5796-3cad-4eb3-92bb-406fc5f918db" />

Upload/update Registry Data
<img width="1874" height="910" alt="Screenshot From 2025-08-18 11-12-54" src="https://github.com/user-attachments/assets/3ca7ceab-6d89-4211-941a-88098f6fa5b2" />

User Management
<img width="1870" height="955" alt="Screenshot From 2025-08-18 11-14-51" src="https://github.com/user-attachments/assets/a7efe7df-a2c1-4672-8484-1ec1ba5c3cd6" />


## **Contact**
For support or inquiries, contact the **Vanuatu Labour Registry** development team:
- **Email**: htevilili@vanuatu.gov.vu

---

*Engineered for the **Vanuatu Bureau of Statistics** with **Laravel**, **React JS**, May 2025*
