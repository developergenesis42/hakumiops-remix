-- Test Daily Report Data for Monthly Report Testing
-- Copy and paste this into your Supabase SQL Editor

-- Insert test daily report for January 15, 2025
INSERT INTO daily_reports (
  id,
  report_date,
  total_revenue,
  shop_revenue,
  therapist_payouts,
  session_count,
  walkout_count,
  report_data,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '2025-01-15',
  8500.00,
  5200.00,
  2800.00,
  8,
  3,
  '{
    "completed_sessions": [
      {
        "id": "test-session-1",
        "service_id": 1,
        "therapist_ids": ["test-therapist-1"],
        "room_id": "test-room-1",
        "status": "Completed",
        "start_time": "2025-01-15T10:00:00Z",
        "end_time": "2025-01-15T10:40:00Z",
        "duration": 40,
        "price": 1200.00,
        "payout": 400.00,
        "payment_method": "Cash",
        "discount": 0,
        "addon_items": [],
        "addon_custom_amount": 0,
        "customer_nationality": "Chinese",
        "vip_number": 123,
        "notes": "Regular customer"
      },
      {
        "id": "test-session-2",
        "service_id": 2,
        "therapist_ids": ["test-therapist-2"],
        "room_id": "test-room-2",
        "status": "Completed",
        "start_time": "2025-01-15T11:00:00Z",
        "end_time": "2025-01-15T12:00:00Z",
        "duration": 60,
        "price": 1800.00,
        "payout": 600.00,
        "payment_method": "Thai QR Code",
        "discount": 200,
        "addon_items": [{"name": "Oil Massage", "price": 300}],
        "addon_custom_amount": 0,
        "customer_nationality": "Foreigner",
        "vip_number": null,
        "notes": "First time customer"
      }
    ],
    "walkouts": [
      {
        "id": "test-walkout-1",
        "reason": "No Rooms",
        "count": 2,
        "created_at": "2025-01-15T14:30:00Z"
      },
      {
        "id": "test-walkout-2",
        "reason": "Price Too High",
        "count": 1,
        "created_at": "2025-01-15T16:00:00Z"
      }
    ],
    "shop_expenses": [
      {
        "id": "test-expense-1",
        "amount": 150.00,
        "note": "Cleaning supplies",
        "created_at": "2025-01-15T09:00:00Z"
      },
      {
        "id": "test-expense-2",
        "amount": 300.00,
        "note": "Massage oil",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "therapist_summaries": [
      {
        "id": "test-therapist-1",
        "name": "Anna",
        "status": "Available",
        "check_in_time": "2025-01-15T09:00:00Z",
        "check_out_time": "2025-01-15T18:00:00Z",
        "completed_room_ids": ["test-room-1"],
        "total_expenses": 50.00,
        "session_count": 1
      },
      {
        "id": "test-therapist-2",
        "name": "Bella",
        "status": "Available",
        "check_in_time": "2025-01-15T10:00:00Z",
        "check_out_time": "2025-01-15T19:00:00Z",
        "completed_room_ids": ["test-room-2"],
        "total_expenses": 100.00,
        "session_count": 1
      }
    ]
  }'::jsonb,
  '2025-01-15T20:00:00Z'
);

-- Insert test daily report for January 16, 2025
INSERT INTO daily_reports (
  id,
  report_date,
  total_revenue,
  shop_revenue,
  therapist_payouts,
  session_count,
  walkout_count,
  report_data,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '2025-01-16',
  12000.00,
  7800.00,
  3600.00,
  12,
  1,
  '{
    "completed_sessions": [
      {
        "id": "test-session-3",
        "service_id": 3,
        "therapist_ids": ["test-therapist-1", "test-therapist-3"],
        "room_id": "test-room-1",
        "status": "Completed",
        "start_time": "2025-01-16T09:00:00Z",
        "end_time": "2025-01-16T10:30:00Z",
        "duration": 90,
        "price": 2500.00,
        "payout": 800.00,
        "payment_method": "WeChat",
        "discount": 0,
        "addon_items": [],
        "addon_custom_amount": 500,
        "customer_nationality": "Chinese",
        "vip_number": 456,
        "notes": "VIP customer"
      }
    ],
    "walkouts": [
      {
        "id": "test-walkout-3",
        "reason": "No Ladies",
        "count": 1,
        "created_at": "2025-01-16T15:00:00Z"
      }
    ],
    "shop_expenses": [
      {
        "id": "test-expense-3",
        "amount": 200.00,
        "note": "Towels",
        "created_at": "2025-01-16T08:00:00Z"
      }
    ],
    "therapist_summaries": [
      {
        "id": "test-therapist-1",
        "name": "Anna",
        "status": "Available",
        "check_in_time": "2025-01-16T08:30:00Z",
        "check_out_time": "2025-01-16T18:30:00Z",
        "completed_room_ids": ["test-room-1"],
        "total_expenses": 75.00,
        "session_count": 1
      },
      {
        "id": "test-therapist-3",
        "name": "Candy",
        "status": "Available",
        "check_in_time": "2025-01-16T09:00:00Z",
        "check_out_time": "2025-01-16T19:00:00Z",
        "completed_room_ids": ["test-room-1"],
        "total_expenses": 100.00,
        "session_count": 1
      }
    ]
  }'::jsonb,
  '2025-01-16T20:30:00Z'
);

-- Verify the test data was inserted
SELECT 
  'Test Data Inserted' as status,
  COUNT(*) as report_count,
  SUM(total_revenue) as total_revenue,
  SUM(shop_revenue) as total_shop_revenue,
  SUM(therapist_payouts) as total_therapist_payouts,
  SUM(session_count) as total_sessions,
  SUM(walkout_count) as total_walkouts
FROM daily_reports 
WHERE report_date BETWEEN '2025-01-15' AND '2025-01-16';
