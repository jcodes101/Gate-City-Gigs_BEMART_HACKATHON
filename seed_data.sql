-- ============================================
-- Seed Data for BE_SMART_HACKATHON
-- 10 Users and 20 Gigs with Real Greensboro, NC Addresses
-- ============================================

-- Insert 10 Users
INSERT INTO `Users` (`uid`, `fname`, `lname`, `username`, `email`, `avatar_url`, `User_roles`, `password`) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah', 'Mitchell', 'sarahmitchell', 'sarah.mitchell@greensboro.nc', 'https://i.pravatar.cc/150?img=1', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440002', 'James', 'Thompson', 'jamesthompson', 'james.thompson@greensboro.nc', 'https://i.pravatar.cc/150?img=2', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440003', 'Maria', 'Rodriguez', 'mariarodriguez', 'maria.rodriguez@greensboro.nc', 'https://i.pravatar.cc/150?img=3', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440004', 'David', 'Chen', 'davidchen', 'david.chen@greensboro.nc', 'https://i.pravatar.cc/150?img=4', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440005', 'Emily', 'Johnson', 'emilyjohnson', 'emily.johnson@greensboro.nc', 'https://i.pravatar.cc/150?img=5', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440006', 'Michael', 'Williams', 'michaelwilliams', 'michael.williams@greensboro.nc', 'https://i.pravatar.cc/150?img=6', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440007', 'Lisa', 'Anderson', 'lisanderson', 'lisa.anderson@greensboro.nc', 'https://i.pravatar.cc/150?img=7', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440008', 'Robert', 'Martinez', 'robertmartinez', 'robert.martinez@greensboro.nc', 'https://i.pravatar.cc/150?img=8', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440009', 'Jennifer', 'Davis', 'jenniferdavis', 'jennifer.davis@greensboro.nc', 'https://i.pravatar.cc/150?img=9', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u'),
('550e8400-e29b-41d4-a716-446655440010', 'Christopher', 'Brown', 'christopherbrown', 'christopher.brown@greensboro.nc', 'https://i.pravatar.cc/150?img=10', 'RESIDENT', '$2b$10$rK9V8V5x5x5x5x5x5x5u');

-- Insert 20 Gigs with Real Greensboro, NC Addresses
INSERT INTO `gigs` (`uid`, `gig_owner`, `gig_name`, `gig_address`, `paid`, `gig_description`, `gig_tag`, `gig_urgency`) VALUES
-- Gigs by Sarah Mitchell (uid: 550e8400-e29b-41d4-a716-446655440001)
('gig-001-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Yard Cleanup Needed', '123 N Elm St, Greensboro, NC 27401', 0, 'Need help cleaning up fallen branches and leaves in the front yard. Yard waste bags provided.', 'VOLUNTEERING', 'MEDIUM'),
('gig-002-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Kitchen Renovation Help', '456 W Market St, Greensboro, NC 27401', 1, 'Looking for someone to help with kitchen cabinet installation. Must have experience with power tools.', 'REAL_ESTATE', 'HIGH'),

-- Gigs by James Thompson (uid: 550e8400-e29b-41d4-a716-446655440002)
('gig-003-550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Pothole Repair on Friendly Ave', '789 Friendly Ave, Greensboro, NC 27401', 0, 'Large pothole causing damage to vehicles. Needs immediate attention from city or volunteers.', 'INFRASTRUCTURE', 'HIGH'),
('gig-004-550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Event Setup Assistant', '321 S Elm St, Greensboro, NC 27401', 1, 'Need help setting up tables and chairs for community event this Saturday morning.', 'HOSPITALITY', 'MEDIUM'),

-- Gigs by Maria Rodriguez (uid: 550e8400-e29b-41d4-a716-446655440003)
('gig-005-550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Community Garden Maintenance', '654 Battleground Ave, Greensboro, NC 27408', 0, 'Weekly volunteer opportunity to help maintain the community garden. Tools provided.', 'VOLUNTEERING', 'LOW'),
('gig-006-550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Apartment Painting Job', '987 Spring Garden St, Greensboro, NC 27403', 1, 'Painting two bedrooms and living room. Must provide own brushes and rollers.', 'REAL_ESTATE', 'MEDIUM'),

-- Gigs by David Chen (uid: 550e8400-e29b-41d4-a716-446655440004)
('gig-007-550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Sidewalk Repair Needed', '147 Lawndale Dr, Greensboro, NC 27408', 0, 'Cracked sidewalk in front of property needs repair. Safety hazard for pedestrians.', 'INFRASTRUCTURE', 'HIGH'),
('gig-008-550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Catering Assistant Needed', '258 Wendover Ave, Greensboro, NC 27408', 1, 'Looking for help with food service at local event. Must have food handler certification.', 'HOSPITALITY', 'MEDIUM'),

-- Gigs by Emily Johnson (uid: 550e8400-e29b-41d4-a716-446655440005)
('gig-009-550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Food Bank Volunteer', '369 W Gate City Blvd, Greensboro, NC 27407', 0, 'Volunteer opportunity to help sort and distribute food donations. Flexible hours.', 'VOLUNTEERING', 'LOW'),
('gig-010-550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Home Staging Help', '741 High Point Rd, Greensboro, NC 27403', 1, 'Need assistance staging home for sale. Moving furniture and arranging decor.', 'REAL_ESTATE', 'MEDIUM'),

-- Gigs by Michael Williams (uid: 550e8400-e29b-41d4-a716-446655440006)
('gig-011-550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Street Light Out', '852 N Church St, Greensboro, NC 27401', 0, 'Street light has been out for two weeks. Dark area at night, safety concern.', 'INFRASTRUCTURE', 'HIGH'),
('gig-012-550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Restaurant Server Position', '963 S Elm Eugene St, Greensboro, NC 27406', 1, 'Part-time server position available. Must have weekend availability.', 'HOSPITALITY', 'MEDIUM'),

-- Gigs by Lisa Anderson (uid: 550e8400-e29b-41d4-a716-446655440007)
('gig-013-550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Park Cleanup Day', '159 W Lee St, Greensboro, NC 27401', 0, 'Community park cleanup event. Trash bags and gloves will be provided.', 'VOLUNTEERING', 'LOW'),
('gig-014-550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Bathroom Remodeling', '357 E Bessemer Ave, Greensboro, NC 27401', 1, 'Help needed with bathroom tile installation. Experience preferred but not required.', 'REAL_ESTATE', 'HIGH'),

-- Gigs by Robert Martinez (uid: 550e8400-e29b-41d4-a716-446655440008)
('gig-015-550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Drainage Issue on Street', '468 Summit Ave, Greensboro, NC 27405', 0, 'Water pooling on street after rain. Drain appears to be blocked.', 'INFRASTRUCTURE', 'MEDIUM'),
('gig-016-550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Event Coordinator Assistant', '579 W Friendly Ave, Greensboro, NC 27401', 1, 'Need help coordinating vendors and setup for weekend festival.', 'HOSPITALITY', 'HIGH'),

-- Gigs by Jennifer Davis (uid: 550e8400-e29b-41d4-a716-446655440009)
('gig-017-550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'Senior Center Volunteer', '680 N Main St, Greensboro, NC 27401', 0, 'Volunteer to help with activities and meal service at senior center.', 'VOLUNTEERING', 'LOW'),
('gig-018-550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'Deck Building Project', '791 Randleman Rd, Greensboro, NC 27406', 1, 'Help needed building backyard deck. Must have carpentry experience.', 'REAL_ESTATE', 'MEDIUM'),

-- Gigs by Christopher Brown (uid: 550e8400-e29b-41d4-a716-446655440010)
('gig-019-550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'Traffic Sign Replacement', '802 W Market St, Greensboro, NC 27401', 0, 'Stop sign knocked down by vehicle. Needs immediate replacement for safety.', 'INFRASTRUCTURE', 'HIGH'),
('gig-020-550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'Hotel Front Desk Help', '913 E Wendover Ave, Greensboro, NC 27405', 1, 'Temporary front desk position. Must be available for evening shifts.', 'HOSPITALITY', 'MEDIUM');

