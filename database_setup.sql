-- Lamprey MMAUV Mission Configurator Database
-- Drop existing tables if they exist
DROP TABLE IF EXISTS compatibility_rules;
DROP TABLE IF EXISTS payloads;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS interfaces;

-- Create interfaces table
CREATE TABLE interfaces (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create missions table
CREATE TABLE missions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_power_draw_kw DECIMAL(6,2),
    max_payload_weight_kg DECIMAL(7,2),
    max_payload_volume_l DECIMAL(8,2),
    typical_duration_hours INT
);

-- Create payloads table
CREATE TABLE payloads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    weight_kg DECIMAL(7,2),
    power_draw_kw DECIMAL(6,2),
    interface_id INT,
    dimensions_lxwxh_cm VARCHAR(50),
    volume_l DECIMAL(8,2),
    description TEXT,
    manufacturer VARCHAR(100),
    FOREIGN KEY (interface_id) REFERENCES interfaces(id)
);

-- Create compatibility rules table
CREATE TABLE compatibility_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mission_id INT,
    payload_id INT,
    priority_rank INT DEFAULT 5,
    notes TEXT,
    FOREIGN KEY (mission_id) REFERENCES missions(id),
    FOREIGN KEY (payload_id) REFERENCES payloads(id),
    UNIQUE KEY unique_mission_payload (mission_id, payload_id)
);

-- Insert interface types
INSERT INTO interfaces (name, description) VALUES
('MIL-STD-1553B', 'Dual-redundant serial data bus for military avionics'),
('Gigabit Ethernet', 'High-speed TCP/IP network interface'),
('STANAG 4586', 'NATO standard for UAV control systems'),
('RS-485', 'Industrial serial communication protocol'),
('Fiber Optic', 'High-bandwidth optical data transmission'),
('Universal Payload Interface (UPI)', 'Modular hot-swap connector for rapid reconfiguration');

-- Insert mission types
INSERT INTO missions (name, description, max_power_draw_kw, max_payload_weight_kg, max_payload_volume_l, typical_duration_hours) VALUES
('Seabed Mine Neutralization', 'Deploy expendable neutralization charges or ROV for mine countermeasures in shallow/deep water', 4.5, 180, 650, 12),
('Long-Endurance ISR', 'Persistent surveillance with multi-spectral sensors for contested area monitoring', 2.8, 120, 450, 72),
('Host-Hitch Strike', 'Carry and launch lightweight torpedoes or effectors from host submarine', 3.2, 200, 700, 8),
('Seabed Infrastructure Mapping', 'High-resolution sonar mapping of undersea cables, pipelines, and structures', 3.5, 150, 550, 48),
('Electronic Warfare / Decoy', 'Active acoustic countermeasures and signature emulation for fleet protection', 5.0, 140, 500, 16),
('Oceanographic Survey', 'CTD profiling, water sampling, and environmental data collection', 2.2, 100, 400, 96),
('Covert Intelligence Gathering', 'Tap undersea communications and deploy persistent listening nodes', 1.8, 90, 350, 120),
('Distributed Maritime Ops (DMO) Node', 'Network relay and collaborative targeting hub for manned-unmanned teaming', 3.0, 110, 480, 60);

-- Insert payloads
INSERT INTO payloads (name, type, weight_kg, power_draw_kw, interface_id, dimensions_lxwxh_cm, volume_l, description, manufacturer) VALUES
-- Mine Neutralization Payloads
('Mk 18 Mod 2 Swordfish', 'Expendable Mine Disposal', 95, 1.2, 1, '140x38x38', 202, 'Semi-autonomous mine identification and neutralization charge', 'Hydroid/Huntington Ingalls'),
('REMUS 100 ROV Tender', 'ROV Deploy System', 75, 0.8, 2, '120x35x32', 134, 'Docking system for micro-ROV mine investigation', 'Kongsberg Maritime'),
('SeaFox Expendable Launcher (x4)', 'Kinetic Neutralizer', 68, 0.5, 1, '110x30x28', 92, 'Quad-pack disposable mine disposal vehicles', 'Atlas Elektronik'),

-- ISR Payloads
('AN/BLQ-11 Long-Range Sonar', 'Passive Sonar Array', 105, 2.5, 3, '180x42x40', 302, 'Ultra-low frequency passive detection array with 50nm range', 'Northrop Grumman'),
('Raytheon SeaLynx EO/IR Suite', 'Optical Sensor', 45, 1.8, 2, '95x28x26', 69, 'Dual-band electro-optical/infrared mast sensor', 'Raytheon Technologies'),
('Quantum Magnetometer Array', 'MAD Sensor', 38, 1.2, 6, '85x25x22', 47, 'Sub-surface vessel detection via magnetic anomaly', 'Geometrics Inc'),
('Synthetic Aperture Sonar (SAS) Pod', 'Active Imaging', 88, 2.2, 2, '160x36x34', 196, 'High-resolution seabed mapping and target classification', 'Kraken Robotics'),

-- Strike/Kinetic Payloads
('Mk 54 Lightweight Torpedo (Modified)', 'Offensive Weapon', 178, 0.3, 1, '270x32x32', 218, 'UUV-adapted anti-submarine torpedo with reduced propulsion', 'Raytheon/Northrop'),
('DARPA Barracuda Loitering Munition', 'Expendable Effector', 52, 0.4, 6, '145x22x20', 64, 'Swarm-capable underwater loitering weapon', 'BAE Systems'),

-- EW/Decoy Payloads
('AN/SLQ-25F Nixie Towed Decoy (Compact)', 'Acoustic Countermeasure', 62, 1.5, 1, '200x28x26', 145, 'Miniaturized acoustic torpedo decoy system', 'Lockheed Martin'),
('Thales UltraLink Jammer Pod', 'Active EW', 48, 4.2, 2, '110x32x30', 106, 'Multi-frequency acoustic jammer for area denial', 'Thales Defence'),

-- Survey/Science Payloads
('Teledyne RDI ADCP Package', 'Oceanographic Sensor', 42, 0.9, 2, '75x30x28', 63, 'Acoustic Doppler current profiler with CTD', 'Teledyne Marine'),
('Sea-Bird SBE 911plus CTD', 'Water Analysis', 35, 0.6, 4, '80x24x22', 42, 'Conductivity-temperature-depth profiler', 'Sea-Bird Scientific'),

-- Communications/Network Payloads
('L3Harris MUTT Relay System', 'Network Gateway', 58, 2.8, 2, '130x34x32', 141, 'Multi-domain mesh network node with satellite uplink', 'L3Harris Technologies'),
('Persistent Acoustic Node Launcher (x6)', 'SIGINT Deployment', 44, 0.7, 6, '100x28x26', 73, 'Deploys bottom-anchored listening sensors', 'General Dynamics');

-- Insert compatibility rules (mission-payload mappings)
-- Seabed Mine Neutralization (mission_id = 1)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(1, 1, 1, 'Primary payload - semi-autonomous disposal'),
(1, 2, 2, 'Secondary option for complex scenarios'),
(1, 3, 1, 'High capacity for wide-area clearance'),
(1, 7, 3, 'Provides imaging for post-neutralization BDA');

-- Long-Endurance ISR (mission_id = 2)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(2, 4, 1, 'Primary long-range detection sensor'),
(2, 5, 2, 'Surface surveillance near coastlines'),
(2, 6, 2, 'Submarine hunting capability'),
(2, 7, 1, 'High-res mapping for target identification'),
(2, 14, 3, 'Network relay for data exfiltration');

-- Host-Hitch Strike (mission_id = 3)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(3, 8, 1, 'Full-scale torpedo for high-value targets'),
(3, 9, 2, 'Multiple low-cost effectors for swarming'),
(3, 4, 3, 'Target acquisition support');

-- Seabed Infrastructure Mapping (mission_id = 4)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(4, 7, 1, 'Primary high-resolution imaging'),
(4, 6, 2, 'Detects ferromagnetic infrastructure'),
(4, 12, 3, 'Water column analysis for route planning'),
(4, 13, 3, 'Environmental baseline data');

-- Electronic Warfare / Decoy (mission_id = 5)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(5, 10, 1, 'Primary acoustic decoy system'),
(5, 11, 1, 'Active jamming for torpedo defense'),
(5, 4, 3, 'Threat detection and tracking');

-- Oceanographic Survey (mission_id = 6)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(6, 12, 1, 'Primary current profiling'),
(6, 13, 1, 'Water chemistry analysis'),
(6, 7, 2, 'Seabed topography mapping');

-- Covert Intelligence Gathering (mission_id = 7)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(7, 15, 1, 'Deploy persistent listening grid'),
(7, 14, 2, 'Data relay to friendly forces'),
(7, 4, 2, 'Initial area reconnaissance'),
(7, 6, 3, 'Detect ferromagnetic signatures');

-- DMO Node (mission_id = 8)
INSERT INTO compatibility_rules (mission_id, payload_id, priority_rank, notes) VALUES
(8, 14, 1, 'Primary network relay function'),
(8, 4, 2, 'Collaborative sensing capability'),
(8, 7, 2, 'Shared battlespace awareness'),
(8, 9, 3, 'Optional distributed lethality');
