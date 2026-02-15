// Lamprey MMAUV Configurator - Main Application Logic

let selectedMission = null;
let availablePayloads = [];
let selectedPayloads = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMissions();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('missionSelect').addEventListener('change', handleMissionChange);
    document.getElementById('generateConfig').addEventListener('click', generateConfiguration);
    document.getElementById('clearSelection').addEventListener('click', clearSelection);
}

// Load all available missions
async function loadMissions() {
    try {
        const response = await fetch('api/get_missions.php');
        const data = await response.json();
        
        if (data.success) {
            populateMissionDropdown(data.missions);
        } else {
            showError('Failed to load missions: ' + data.error);
        }
    } catch (error) {
        showError('Error loading missions: ' + error.message);
    }
}

function populateMissionDropdown(missions) {
    const select = document.getElementById('missionSelect');
    select.innerHTML = '<option value="">-- Select a Mission Profile --</option>';
    
    missions.forEach(mission => {
        const option = document.createElement('option');
        option.value = mission.id;
        option.textContent = mission.name;
        option.dataset.mission = JSON.stringify(mission);
        select.appendChild(option);
    });
}

// Handle mission selection change
async function handleMissionChange(event) {
    const select = event.target;
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption.value) {
        hideMissionInfo();
        hidePayloadSection();
        hideConfigOutput();
        return;
    }
    
    selectedMission = JSON.parse(selectedOption.dataset.mission);
    displayMissionInfo(selectedMission);
    await loadCompatiblePayloads(selectedMission.id);
}

function displayMissionInfo(mission) {
    const infoDiv = document.getElementById('missionInfo');
    infoDiv.style.display = 'block';
    
    infoDiv.innerHTML = `
        <h3>${mission.name}</h3>
        <p>${mission.description}</p>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Max Power Draw</div>
                <div class="info-value">${mission.max_power_draw_kw} kW</div>
            </div>
            <div class="info-item">
                <div class="info-label">Max Payload Weight</div>
                <div class="info-value">${mission.max_payload_weight_kg} kg</div>
            </div>
            <div class="info-item">
                <div class="info-label">Max Payload Volume</div>
                <div class="info-value">${mission.max_payload_volume_l} L</div>
            </div>
            <div class="info-item">
                <div class="info-label">Typical Duration</div>
                <div class="info-value">${mission.typical_duration_hours} hrs</div>
            </div>
        </div>
    `;
}

function hideMissionInfo() {
    document.getElementById('missionInfo').style.display = 'none';
}

// Load compatible payloads for selected mission
async function loadCompatiblePayloads(missionId) {
    try {
        showLoading();
        const response = await fetch(`api/get_compatible_payloads.php?mission_id=${missionId}`);
        const data = await response.json();
        
        if (data.success) {
            availablePayloads = data.payloads;
            displayPayloads(data.payloads);
        } else {
            showError('Failed to load payloads: ' + data.error);
        }
    } catch (error) {
        showError('Error loading payloads: ' + error.message);
    }
}

function displayPayloads(payloads) {
    const section = document.getElementById('payloadSection');
    const tbody = document.getElementById('payloadTableBody');
    
    if (payloads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No compatible payloads found for this mission.</td></tr>';
        section.style.display = 'block';
        return;
    }
    
    tbody.innerHTML = '';
    
    payloads.forEach(payload => {
        const row = document.createElement('tr');
        row.className = `priority-${payload.priority_rank}`;
        
        const statusClass = payload.compatibility_status === 'Compatible' ? 'status-compatible' : 'status-warning';
        
        row.innerHTML = `
            <td><input type="checkbox" class="payload-checkbox" data-payload-id="${payload.id}"></td>
            <td><strong>${payload.name}</strong><br><small>${payload.manufacturer}</small></td>
            <td>${payload.type}</td>
            <td>${payload.weight_kg}</td>
            <td>${payload.power_draw_kw}</td>
            <td>${payload.volume_l}</td>
            <td>${payload.interface_name || 'N/A'}</td>
            <td class="${statusClass}">${payload.compatibility_status}</td>
            <td><small>${payload.notes || payload.description}</small></td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add checkbox listeners
    document.querySelectorAll('.payload-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedPayloads);
    });
    
    section.style.display = 'block';
    updateGenerateButton();
}

function showLoading() {
    const section = document.getElementById('payloadSection');
    const tbody = document.getElementById('payloadTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="loading">
                <div class="spinner"></div>
                Loading compatible payloads...
            </td>
        </tr>
    `;
    section.style.display = 'block';
}

function hidePayloadSection() {
    document.getElementById('payloadSection').style.display = 'none';
}

function updateSelectedPayloads() {
    selectedPayloads = [];
    document.querySelectorAll('.payload-checkbox:checked').forEach(checkbox => {
        selectedPayloads.push(parseInt(checkbox.dataset.payloadId));
    });
    updateGenerateButton();
}

function updateGenerateButton() {
    const button = document.getElementById('generateConfig');
    button.disabled = selectedPayloads.length === 0;
}

function clearSelection() {
    document.querySelectorAll('.payload-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedPayloads = [];
    updateGenerateButton();
    hideConfigOutput();
}

// Generate mission configuration
async function generateConfiguration() {
    if (selectedPayloads.length === 0 || !selectedMission) {
        return;
    }
    
    try {
        const response = await fetch('api/generate_config.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mission_id: selectedMission.id,
                payload_ids: selectedPayloads
            })
        });
        
        const config = await response.json();
        
        if (config.success) {
            displayConfiguration(config);
        } else {
            showError('Failed to generate configuration: ' + config.error);
        }
    } catch (error) {
        showError('Error generating configuration: ' + error.message);
    }
}

function displayConfiguration(config) {
    const output = document.getElementById('configOutput');
    
    let html = `
        <div class="config-header">
            <div>
                <h2>Mission Configuration Generated</h2>
                <div class="config-id">CONFIG ID: ${config.config_id}</div>
                <div style="color: var(--text-secondary); margin-top: 5px;">Generated: ${config.timestamp}</div>
            </div>
            <div class="status-badge status-${config.status.toLowerCase()}">${config.status}</div>
        </div>
        
        <h3 style="color: var(--accent-blue); margin-bottom: 15px;">Mission: ${config.mission.name}</h3>
        
        <div class="utilization-bars">
            <div class="util-bar">
                <div class="util-label">
                    <span>Weight Utilization</span>
                    <span><strong>${config.totals.weight_kg} kg</strong> / ${config.mission.max_payload_weight_kg} kg</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${getUtilizationClass(config.utilization.weight_percent)}" 
                         style="width: ${Math.min(config.utilization.weight_percent, 100)}%">
                    </div>
                </div>
                <div style="text-align: right; margin-top: 5px; color: var(--text-secondary);">
                    ${config.utilization.weight_percent}%
                </div>
            </div>
            
            <div class="util-bar">
                <div class="util-label">
                    <span>Power Utilization</span>
                    <span><strong>${config.totals.power_draw_kw} kW</strong> / ${config.mission.max_power_draw_kw} kW</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${getUtilizationClass(config.utilization.power_percent)}" 
                         style="width: ${Math.min(config.utilization.power_percent, 100)}%">
                    </div>
                </div>
                <div style="text-align: right; margin-top: 5px; color: var(--text-secondary);">
                    ${config.utilization.power_percent}%
                </div>
            </div>
            
            <div class="util-bar">
                <div class="util-label">
                    <span>Volume Utilization</span>
                    <span><strong>${config.totals.volume_l} L</strong> / ${config.mission.max_payload_volume_l} L</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${getUtilizationClass(config.utilization.volume_percent)}" 
                         style="width: ${Math.min(config.utilization.volume_percent, 100)}%">
                    </div>
                </div>
                <div style="text-align: right; margin-top: 5px; color: var(--text-secondary);">
                    ${config.utilization.volume_percent}%
                </div>
            </div>
        </div>
    `;
    
    if (config.warnings.length > 0) {
        html += `
            <div class="warnings">
                <h3>⚠️ Configuration Warnings</h3>
                ${config.warnings.map(w => `<div class="warning-item">• ${w}</div>`).join('')}
            </div>
        `;
    }
    
    html += `
        <h3 style="color: var(--accent-blue); margin: 25px 0 15px 0;">Selected Payloads (${config.payloads.length})</h3>
        <table>
            <thead>
                <tr>
                    <th>Payload Name</th>
                    <th>Type</th>
                    <th>Weight (kg)</th>
                    <th>Power (kW)</th>
                    <th>Volume (L)</th>
                    <th>Interface</th>
                </tr>
            </thead>
            <tbody>
                ${config.payloads.map(p => `
                    <tr>
                        <td><strong>${p.name}</strong><br><small>${p.manufacturer}</small></td>
                        <td>${p.type}</td>
                        <td>${p.weight_kg}</td>
                        <td>${p.power_draw_kw}</td>
                        <td>${p.volume_l}</td>
                        <td>${p.interface_name || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 5px;">
            <button onclick="window.print()" style="background: var(--success); color: white; margin-right: 10px;">
                📄 Print Configuration
            </button>
            <button onclick="copyConfigToClipboard('${config.config_id}')" style="background: var(--navy-light); color: white;">
                📋 Copy Config ID
            </button>
        </div>
    `;
    
    output.innerHTML = html;
    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth' });
}

function getUtilizationClass(percent) {
    if (percent > 100) return 'danger';
    if (percent > 90) return 'warning';
    return '';
}

function hideConfigOutput() {
    document.getElementById('configOutput').style.display = 'none';
}

function copyConfigToClipboard(configId) {
    navigator.clipboard.writeText(configId).then(() => {
        alert('Configuration ID copied to clipboard: ' + configId);
    });
}

function showError(message) {
    alert('Error: ' + message);
    console.error(message);
}
