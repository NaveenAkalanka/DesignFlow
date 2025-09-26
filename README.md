# 🎨 DesignFlow

DesignFlow is a custom web application built to streamline **outlet design tracking** and **artwork approvals**.  
It was created as an internal solution to replace the old “Outlet App,” which lacked good UI/UX and proper tracking features.

---

## ⚙️ Environment Setup

Before running the project, create a `.env` file in the root directory with the following variables:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

⚠️ **Never commit your `.env` file** to GitHub — keep it private.

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

---

## 📖 Documentation

### 1. Background
The company originally used a third-party **Outlet App** to manage artwork approvals, but it was not designed for service providers.  
Problems included:
- Poor UI/UX.  
- No clear progress tracking.  
- Hard for managers and co-workers to see updates.  

**DesignFlow** was created to solve these problems with a clean, color-coded, and efficient system.

---

### 2. Project Scope
**In-Scope**
- Authentication with Supabase.  
- Adding, editing, deleting outlet records.  
- Tracking statuses: Design, Submission, BOQ, Quotation, Approval.  
- Color-coded UI indicators.  
- Search & filter functionality.  
- Metrics dashboard for pending/outstanding tasks.  

**Out-of-Scope (MVP)**
- Notifications.  
- Export to Excel/PDF.  
- Multi-user roles.  
- Analytics dashboards.  

---

### 3. Timeline
- **Week 1**: UI/UX design in Figma.  
- **Week 2**: Development of core app.  
- **Rebranding**: OutletFlow → **DesignFlow**.  
- **Deployment**: Netlify hosting + Supabase backend.  

---

### 4. Stakeholders
- **Developer/Designer**: Naveen Akalanka.  
- **End Users**: Co-workers (designers).  
- **Management**: Higher-ups tracking progress.  

---

### 5. Requirements

#### Functional
- User authentication (login/logout).  
- Add/edit/delete outlet records.  
- Track status of design, submission, BOQ, quotation, and approval.  
- Search and filter outlets.  
- Metrics dashboard.  

#### Non-Functional
- **Security**: Supabase RLS policies.  
- **Usability**: Clean UI with intuitive color-coded pills.  
- **Performance**: Fast Supabase queries, responsive frontend.  
- **Maintainability**: Clean React file structure.  
- **Reliability**: Authenticated-only access.  

---

### 6. System Architecture

```plaintext
+-------------+          +------------------+          +-----------------+
|   Frontend  |  --->    |  Supabase Auth   |  --->    | PostgreSQL DB   |
| React+Vite  |          | (Authentication) |          |   (Outlets)     |
+-------------+          +------------------+          +-----------------+
```

**Components**
- `Login.jsx` → Authentication UI.  
- `App.jsx` → Dashboard, metrics, CRUD.  
- `DropdownPill` → Color-coded status updates.  
- Modals → Add, Edit, Filter Outlets.  

---

### 7. Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Phosphor Icons.  
- **Backend**: Supabase (Auth + PostgreSQL).  
- **Hosting**: Netlify.  
- **Design**: Figma.  
- **Tools**: ESLint, GitHub.  

---

### 8. Database Design

**Schema**

```sql
create table outlets (
  id uuid primary key default gen_random_uuid(),
  rt_code varchar(20) not null unique,
  outlet_name text not null,
  design_status text check (design_status in ('Hold','Working','Pending','Canceled','Done')) default 'Pending',
  design_submission text check (design_submission in ('Done','Pending','Hold')) default 'Pending',
  design_boq text check (design_boq in ('Done','Pending','Hold')) default 'Pending',
  design_quotation text check (design_quotation in ('Done','Pending','Hold')) default 'Pending',
  drive_brand text check (drive_brand in ('LL','SB','ST','TB','CB','CBSB','NON','HAN')) default 'NON',
  approval_status text check (approval_status in ('Approved','Pending')) default 'Pending',
  created_at timestamp default now()
);
```

**RLS Policies**

```sql
alter table outlets enable row level security;

-- Read
create policy "Allow logged-in read"
on outlets for select
using (auth.uid() is not null);

-- Insert
create policy "Allow logged-in insert"
on outlets for insert
with check (auth.uid() is not null);

-- Update
create policy "Allow logged-in update"
on outlets for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Delete
create policy "Allow logged-in delete"
on outlets for delete
using (auth.uid() is not null);
```

---

### 9. Implementation

**File Structure**

```plaintext
src/
 ├── App.jsx            # Main dashboard
 ├── Login.jsx          # Authentication
 ├── supabaseClient.js  # Supabase connection
 ├── App.css / index.css
 └── main.jsx
public/
 └── DesignFLow.svg     # Logo
```

**Core Modules**
- `Login.jsx`: Handles authentication via Supabase.  
- `App.jsx`: Displays dashboard, metrics, outlets table, filters, and CRUD operations.  
- `DropdownPill`: Color-coded status selector.  
- Modals: Add, Edit, and Filter outlets.  

---

### 10. Issues & Solutions (Codebase)

- **Issue:** Supabase queries returning `null` on first load.  
  - **Solution:** Wrapped data loading inside `useEffect` after session check.  

- **Issue:** Dropdowns not closing when clicking outside.  
  - **Solution:** Added `mousedown` listener with `ref` to detect outside clicks.  

- **Issue:** Tailwind classes conflicting on table layout.  
  - **Solution:** Used `border-separate border-spacing-y-3` and adjusted scaling with `sm:scale-100 scale-90`.  

- **Issue:** Auth session not persisting on reload.  
  - **Solution:** Used `supabase.auth.getUser()` and `onAuthStateChange` to restore session.  

- **Issue:** Netlify build failing due to exposed keys.  
  - **Solution:** Moved keys into `.env` and configured `netlify.toml` to pass environment variables.  

---

### 11. Testing
- Manual CRUD operations verified.  
- RLS policies tested (no access without login).  
- Search and filter validated with sample data.  
- UI responsiveness tested on desktop and mobile.  

---

### 12. Deployment
- **Platform**: Netlify.  
- **Build Command**: `vite build`.  
- **Environment Variables**: Set via Netlify Dashboard.  
- **Continuous Deployment**: Integrated with GitHub repo.  

---

### 13. Future Roadmap
- 📢 Notifications when statuses change.  
- 📤 Export reports (Excel/PDF).  
- 👥 Multi-user roles and collaboration.  
- 📈 Analytics dashboard (progress trends, performance).  

---

### 14. Conclusion
DesignFlow successfully replaced the inefficient Outlet App with a tailored solution that:  
- Simplifies tracking of outlet design progress.  
- Provides clear, color-coded visual indicators.  
- Ensures secure data handling with Supabase RLS.  

It was designed, developed, and deployed within **1 week** and continues to evolve with new features planned.  

---

👨‍💻 **Developer**: Naveen Akalanka  
📅 **Duration**: ~1 week (Design → Development → Deployment)  
🚀 **Rebranding**: OutletFlow → DesignFlow  
