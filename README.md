# DasBoot Work Order Ticketing System

A comprehensive web-based home maintenance work order management system built by **FABREulous Technology**.

## 🏠 Overview

DasBoot is a modern, responsive work order ticketing system designed for managing home maintenance issues. It provides an intuitive interface for creating, tracking, and managing maintenance requests while maintaining contractor relationships and communication.

## ✨ Features

### 📊 Dashboard
- **Real-time statistics** showing total orders, pending, in-progress, and completed work
- **Order filtering** by status and category
- **Visual status indicators** with color-coded priority levels
- **Recent orders overview** with quick access to details

### 📝 Work Order Management
- **Create new work orders** with detailed information:
  - Issue title and description
  - Category selection (Plumbing, Electrical, HVAC, Carpentry, etc.)
  - Priority levels (Low, Medium, High, Urgent)
  - Location specification
  - Budget estimation
  - Due date scheduling
- **Status tracking** from creation to completion
- **Order assignment** to contractors
- **Detailed order views** with full history

### 👷 Contractor Management
- **Add and manage contractors** with complete profiles:
  - Company name and contact information
  - Email and phone details
  - Specialty areas and expertise
  - Rating system (1-5 stars)
  - Custom notes and history
- **Contractor directory** with search and filtering
- **Local contractor search** simulation for finding new contractors
- **Easy contractor assignment** to work orders

### 📧 Communication Features
- **Email integration** using mailto links
- **Customizable email templates** for contractor communication
- **Automated email composition** with work order details
- **Template variables** for personalized messages

### 🔧 Data Management
- **Local storage persistence** for offline capability
- **Export/Import functionality** for data portability
- **Data backup and restore** capabilities
- **Clear data option** with confirmation prompts

### 📱 Responsive Design
- **Mobile-friendly interface** that works on all devices
- **Touch-optimized controls** for mobile interaction
- **Adaptive layouts** for different screen sizes
- **Modern UI/UX** with smooth animations and transitions

## 🚀 Getting Started

### Installation
1. Clone or download the project files
2. Ensure you have the following files in your directory:
   - `index.html` - Main application file
   - `styles.css` - Styling and responsive design
   - `script.js` - Application logic and functionality

### Running the Application
1. Open `index.html` in any modern web browser
2. The application runs entirely client-side (no server required)
3. Data is automatically saved to browser local storage

### First Use
1. Navigate to the **Contractors** tab to add your preferred contractors
2. Use **New Order** tab to create your first work order
3. Assign contractors and track progress from the **Dashboard**

## 📁 File Structure

```
workorder/
├── index.html          # Main application interface
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript application logic
└── README.md           # This documentation file
```

## 🎨 Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Grid, Flexbox, and animations
- **Vanilla JavaScript** - No external dependencies
- **Font Awesome** - Icon library for enhanced UI
- **Local Storage API** - Client-side data persistence

## 🔧 Configuration

### Email Templates
Customize email templates in the **Settings** tab:
- Use template variables like `{{orderTitle}}`, `{{contractorName}}`
- Modify subject lines and message content
- Set your default email address for communications

### Categories and Priorities
The system includes predefined categories:
- Plumbing, Electrical, HVAC, Carpentry
- Painting, Roofing, Landscaping, Other

Priority levels:
- Low, Medium, High, Urgent (with color coding)

## 💾 Data Backup

### Export Data
- Click **Export Data** in Settings to download a JSON backup
- File includes all work orders, contractors, and settings
- Backup files are timestamped for easy identification

### Import Data
- Use **Import Data** to restore from a JSON backup file
- Data validation ensures compatibility
- Existing data is replaced with imported data

## 🌐 Browser Compatibility

- **Chrome** (recommended)
- **Firefox**
- **Safari**
- **Edge**
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 📧 Support and Contact

**FABREulous Technology**
- Copyright © 2025 FABREulous Technology
- All rights reserved

## 🚀 Future Enhancements

Potential features for future versions:
- Integration with external contractor APIs
- Photo upload for work orders
- Time tracking and billing
- Notification system
- Multi-user support
- Cloud synchronization

## 📜 License

Copyright © 2025 FABREulous Technology. All rights reserved.

## 🔄 Version History

- **v1.0** - Initial release with core functionality
  - Work order creation and management
  - Contractor management
  - Dashboard and reporting
  - Email integration
  - Data export/import
  - Responsive design

---

*Built with ❤️ by FABREulous Technology*
