# Hakumi Ops - Massage Therapy Management System

A comprehensive web application for managing massage therapy operations, built with Remix and Supabase. This system provides real-time management of therapists, rooms, sessions, bookings, and financial tracking for massage therapy businesses.

## 🌟 Features

### 👥 Therapist Management
- **Real-time Status Tracking**: Monitor therapist availability (Rostered, Available, In Session, Departed)
- **Check-in/Check-out System**: Track work hours and duty status
- **Therapist Profiles**: Manage individual therapist information and performance
- **Payout Management**: Calculate and track therapist earnings
- **Expense Tracking**: Record individual therapist expenses

### 🏠 Room Management
- **Room Types**: Support for Shower, Large Shower, and VIP Jacuzzi rooms
- **Real-time Availability**: Live room status updates (Available/Occupied)
- **Room Assignment**: Automatic room allocation for sessions
- **Room History**: Track completed sessions per room

### 💆‍♀️ Session Management
- **Service Categories**: 1 Lady, 2 Ladies, and Couple services
- **Flexible Pricing**: Customizable service pricing and therapist payouts
- **Session Tracking**: Real-time session status (Ready, In Progress, Completed)
- **Payment Methods**: Support for Cash, Thai QR Code, WeChat, Alipay, and FX Cash
- **VIP System**: VIP customer tracking with special numbering (1-1000)
- **Add-on Items**: Custom add-on services with pricing
- **Session Notes**: Detailed customer and session notes
- **Discount System**: Built-in discount options (0, 200, 300 THB)

### 📅 Booking System
- **Advanced Scheduling**: Schedule appointments with specific therapists and times
- **Booking Management**: Create, modify, and cancel bookings
- **Service Integration**: Seamless integration with available services
- **Booking Notes**: Add special instructions for bookings

### 💰 Financial Management
- **Real-time Revenue Tracking**: Live financial calculations
- **Multiple Revenue Streams**: Track different payment methods separately
- **Expense Management**: Shop and therapist expense tracking
- **Financial Reports**: Daily and monthly financial summaries
- **Payout Calculations**: Automatic therapist payout calculations
- **Profit Analysis**: Net profit and shop revenue tracking

### 📊 Reporting & Analytics
- **Daily Reports**: Comprehensive daily operations reports
- **Monthly Reports**: Monthly financial and performance analytics
- **Therapist Performance**: Individual therapist statistics and earnings
- **Walkout Tracking**: Monitor customer walkouts with categorized reasons
- **Financial Summaries**: Detailed revenue and expense breakdowns

### 🖨️ Printing System
- **Receipt Printing**: Automatic receipt generation via PrintNode
- **Daily Report Printing**: Print daily operations reports
- **Multiple Printer Support**: Configure multiple printers
- **PDF Generation**: Professional PDF formatting for all documents

### 🔄 Real-time Features
- **Live Updates**: Real-time synchronization across all devices
- **Multi-device Support**: Multiple users can work simultaneously
- **Optimistic Updates**: Immediate UI updates for better user experience
- **Conflict Resolution**: Handle concurrent edits gracefully

## 🛠️ Technology Stack

- **Frontend**: Remix, React, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Real-time**: Supabase Realtime
- **Printing**: PrintNode API
- **PDF Generation**: jsPDF
- **Deployment**: Netlify

## 🚀 Quick Start

### Prerequisites
- Node.js 20.0.0 or higher
- Supabase account
- PrintNode account (for printing features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hakumiops-remix.git
   cd hakumiops-remix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/` directory
   - Get your Supabase URL and anon key

4. **Configure environment variables**
   Create a `.env.local` file:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PRINTNODE_API_KEY=your_printnode_api_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Database Setup

The application uses Supabase with the following main tables:

- **therapists**: Therapist management and status tracking
- **rooms**: Room availability and types
- **services**: Available massage services and pricing
- **sessions**: Active and completed sessions
- **bookings**: Scheduled appointments
- **therapist_expenses**: Individual therapist expenses
- **shop_expenses**: General shop expenses
- **walkouts**: Customer walkout tracking
- **daily_reports**: Daily financial reports

### Running Migrations

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the migration files in order:
   - `20250224170000_create_therapists_table.sql`
   - `20250224170001_insert_initial_data.sql`
   - Additional migration files as needed

## 🖨️ PrintNode Setup

For receipt printing functionality:

1. **Create PrintNode Account**
   - Sign up at [PrintNode](https://www.printnode.com/)
   - Install PrintNode client on your computer
   - Connect your printer

2. **Get API Key**
   - Go to PrintNode Dashboard > Account > API Keys
   - Copy your API key

3. **Configure Environment**
   - Add `PRINTNODE_API_KEY=your_api_key` to `.env.local`

4. **Test Printing**
   - Create a session in the app
   - Receipt should print automatically

## 📱 Usage Guide

### Managing Therapists
1. **Add Therapist**: Click "Add Therapist" button
2. **Check In**: Set therapist status to "Available"
3. **Assign to Session**: Select therapist when creating sessions
4. **Track Performance**: View earnings and completed sessions
5. **Check Out**: Set status to "Departed" at end of shift

### Creating Sessions
1. **Select Service**: Choose from available services
2. **Assign Therapists**: Select one or more therapists
3. **Choose Room**: Pick available room
4. **Set Details**: Add payment method, VIP number, notes
5. **Start Session**: Begin tracking session time
6. **Complete Session**: End session and calculate payouts

### Managing Bookings
1. **Create Booking**: Schedule future appointments
2. **Assign Resources**: Select therapists and time slots
3. **Start from Booking**: Convert booking to active session
4. **Modify/Cancel**: Update booking details as needed

### Financial Tracking
1. **View Dashboard**: Real-time financial overview
2. **Add Expenses**: Record shop and therapist expenses
3. **Generate Reports**: Create daily/monthly reports
4. **Track Payouts**: Monitor therapist earnings

## 🔧 Configuration

### Service Configuration
Services are pre-configured with:
- **1 Lady Services**: 40-90 minute sessions
- **2 Ladies Services**: 60-90 minute sessions  
- **Couple Services**: 60-90 minute sessions
- **Room Types**: Shower, Large Shower, VIP Jacuzzi
- **Pricing**: Configurable per service

### Room Configuration
Default rooms include:
- 3 Shower rooms
- 2 Large Shower rooms
- 4 VIP Jacuzzi rooms

### Payment Methods
Supported payment types:
- Cash (THB)
- Thai QR Code
- WeChat Pay
- Alipay
- FX Cash (other currencies)

## 🚀 Deployment

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/hakumiops-remix)

1. **Connect Repository**: Link your GitHub repository
2. **Set Environment Variables**: Add Supabase and PrintNode keys
3. **Deploy**: Automatic deployment on push to main branch

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy build folder**
   - Upload `build/` folder to your hosting provider
   - Configure environment variables
   - Set up Supabase database

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security policies
- **Input Validation**: Server-side validation for all operations
- **SQL Injection Prevention**: Parameterized queries
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management

## 📈 Performance Features

- **Real-time Updates**: Live data synchronization
- **Optimistic UI**: Immediate user feedback
- **Database Indexing**: Optimized query performance
- **Lazy Loading**: Efficient resource usage
- **Caching**: Smart data caching strategies

## 🧪 Testing

### Database Connection Test
```bash
node test-db-connection.js
```

### PrintNode Test
```bash
node test-printing.js
```

## 📚 API Documentation

### Main Endpoints
- `/api/therapists` - Therapist management
- `/api/sessions` - Session operations
- `/api/bookings` - Booking management
- `/api/rooms` - Room status updates
- `/api/expenses` - Expense tracking
- `/api/financials` - Financial calculations
- `/api/print` - Printing operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [Issues](https://github.com/your-username/hakumiops-remix/issues) page
- Review the [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md) guide
- Check the [PRINTNODE_SETUP.md](PRINTNODE_SETUP.md) for printing issues

## 🔄 Changelog

### Latest Updates
- Enhanced session management with notes and payment tracking
- Added PayoutModal for therapist payouts
- Improved real-time synchronization
- Updated database migrations for payment method tracking
- Enhanced financial reporting capabilities

---

**Built with ❤️ for massage therapy businesses**