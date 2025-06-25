// DasBoot Work Order Management System
class WorkOrderSystem {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('workOrders') || '[]');
        this.contractors = JSON.parse(localStorage.getItem('contractors') || '[]');
        this.settings = JSON.parse(localStorage.getItem('settings') || '{}');
        this.currentTab = 'dashboard';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.renderDashboard();
        this.renderContractors();
        this.setMinDate();
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.getAttribute('data-tab'));
            });
        });

        // Work Order Form
        document.getElementById('work-order-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createWorkOrder(e.target);
        });

        // Contractor Form
        document.getElementById('contractor-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addContractor(e.target);
        });

        // Email Settings Form
        document.getElementById('email-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEmailSettings(e.target);
        });

        // Email Form
        document.getElementById('email-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendEmail(e.target);
        });

        // Modal Controls
        this.bindModalEvents();

        // Filter Controls
        document.getElementById('status-filter').addEventListener('change', () => {
            this.renderOrders();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.renderOrders();
        });

        // Find Contractors Button
        document.getElementById('find-contractors-btn').addEventListener('click', () => {
            this.findLocalContractors();
        });

        // Data Management
        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });
    }

    bindModalEvents() {
        // Add Contractor Modal
        document.getElementById('add-contractor-btn').addEventListener('click', () => {
            this.showModal('contractor-modal');
        });

        document.getElementById('close-contractor-modal').addEventListener('click', () => {
            this.hideModal('contractor-modal');
        });

        document.getElementById('cancel-contractor').addEventListener('click', () => {
            this.hideModal('contractor-modal');
        });

        // Order Detail Modal
        document.getElementById('close-order-modal').addEventListener('click', () => {
            this.hideModal('order-modal');
        });

        // Email Modal
        document.getElementById('close-email-modal').addEventListener('click', () => {
            this.hideModal('email-modal');
        });

        document.getElementById('cancel-email').addEventListener('click', () => {
            this.hideModal('email-modal');
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Refresh content if needed
        if (tabName === 'dashboard') {
            this.renderDashboard();
        } else if (tabName === 'contractors') {
            this.renderContractors();
        }
    }

    // Work Order Management
    createWorkOrder(form) {
        const formData = new FormData(form);
        const order = {
            id: 'WO-' + Date.now(),
            title: formData.get('title'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            description: formData.get('description'),
            location: formData.get('location') || 'Not specified',
            budget: parseFloat(formData.get('budget')) || 0,
            dueDate: formData.get('dueDate') || null,
            status: 'pending',
            assignedContractor: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: []
        };

        this.orders.push(order);
        this.saveData();
        this.renderDashboard();
        
        form.reset();
        this.showMessage('Work order created successfully!', 'success');
        this.switchTab('dashboard');
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            this.saveData();
            this.renderDashboard();
            this.showMessage('Order status updated successfully!', 'success');
        }
    }

    assignContractor(orderId, contractorId) {
        const order = this.orders.find(o => o.id === orderId);
        const contractor = this.contractors.find(c => c.id === contractorId);
        
        if (order && contractor) {
            order.assignedContractor = contractorId;
            order.status = 'assigned';
            order.updatedAt = new Date().toISOString();
            this.saveData();
            this.renderDashboard();
            this.showMessage(`Order assigned to ${contractor.name}!`, 'success');
        }
    }

    deleteOrder(orderId) {
        if (confirm('Are you sure you want to delete this work order?')) {
            this.orders = this.orders.filter(o => o.id !== orderId);
            this.saveData();
            this.renderDashboard();
            this.showMessage('Work order deleted successfully!', 'success');
        }
    }

    // Contractor Management
    addContractor(form) {
        const formData = new FormData(form);
        const specialties = Array.from(form.querySelectorAll('select[name="specialties"] option:checked'))
            .map(option => option.value);

        const contractor = {
            id: 'CONT-' + Date.now(),
            name: formData.get('name'),
            contact: formData.get('contact') || '',
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            specialties: specialties,
            rating: parseInt(formData.get('rating')) || null,
            notes: formData.get('notes') || '',
            createdAt: new Date().toISOString()
        };

        this.contractors.push(contractor);
        this.saveData();
        this.renderContractors();
        
        form.reset();
        this.hideModal('contractor-modal');
        this.showMessage('Contractor added successfully!', 'success');
    }

    deleteContractor(contractorId) {
        if (confirm('Are you sure you want to delete this contractor?')) {
            this.contractors = this.contractors.filter(c => c.id !== contractorId);
            this.saveData();
            this.renderContractors();
            this.showMessage('Contractor deleted successfully!', 'success');
        }
    }

    // Email Functionality
    openEmailModal(contractorId, orderId = null) {
        const contractor = this.contractors.find(c => c.id === contractorId);
        if (!contractor) return;

        document.getElementById('email-to').value = contractor.email;
        
        if (orderId) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                const subject = `Work Order Assignment - ${order.title}`;
                const body = this.generateEmailBody(contractor, order);
                
                document.getElementById('email-subject').value = subject;
                document.getElementById('email-body').value = body;
            }
        } else {
            document.getElementById('email-subject').value = '';
            document.getElementById('email-body').value = '';
        }

        this.showModal('email-modal');
    }

    generateEmailBody(contractor, order) {
        const template = this.settings.emailTemplate || `Subject: Work Order Assignment - {{orderTitle}}

Dear {{contractorName}},

You have been assigned a new work order:

Title: {{orderTitle}}
Category: {{orderCategory}}
Priority: {{orderPriority}}
Description: {{orderDescription}}
Location: {{orderLocation}}
Due Date: {{orderDueDate}}

Please contact us to confirm your availability.

Best regards,
{{userEmail}}`;

        return template
            .replace(/{{contractorName}}/g, contractor.name)
            .replace(/{{orderTitle}}/g, order.title)
            .replace(/{{orderCategory}}/g, order.category)
            .replace(/{{orderPriority}}/g, order.priority)
            .replace(/{{orderDescription}}/g, order.description)
            .replace(/{{orderLocation}}/g, order.location)
            .replace(/{{orderDueDate}}/g, order.dueDate || 'Not specified')
            .replace(/{{userEmail}}/g, this.settings.userEmail || 'your-email@example.com');
    }

    sendEmail(form) {
        const formData = new FormData(form);
        const emailData = {
            to: formData.get('to'),
            subject: formData.get('subject'),
            body: formData.get('body')
        };

        // Create mailto link
        const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        window.open(mailtoLink);

        this.hideModal('email-modal');
        this.showMessage('Email client opened. Please send the email.', 'info');
    }

    // Local Contractors Search
    async findLocalContractors() {
        const category = document.getElementById('order-category').value;
        const location = document.getElementById('order-location').value || 'your area';
        
        if (!category) {
            this.showMessage('Please select a category first.', 'error');
            return;
        }

        // Show loading state
        const resultsDiv = document.getElementById('local-contractors-results');
        const listDiv = document.getElementById('contractors-list');
        
        resultsDiv.style.display = 'block';
        listDiv.innerHTML = '<div class="loading"></div> Searching for local contractors...';

        try {
            // Simulate API call to find local contractors
            const mockContractors = await this.getMockLocalContractors(category, location);
            this.renderLocalContractors(mockContractors);
        } catch (error) {
            listDiv.innerHTML = '<div class="message error">Error finding contractors. Please try again.</div>';
        }
    }

    async getMockLocalContractors(category, location) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock data for demonstration
        const mockData = {
            plumbing: [
                { name: 'QuickFix Plumbing', rating: 4.8, distance: '0.5 miles', phone: '(555) 123-4567', email: 'info@quickfixplumbing.com' },
                { name: 'Pro Plumbers Inc', rating: 4.6, distance: '1.2 miles', phone: '(555) 234-5678', email: 'contact@proplumbers.com' },
                { name: 'Reliable Pipe Works', rating: 4.9, distance: '2.1 miles', phone: '(555) 345-6789', email: 'service@reliablepipe.com' }
            ],
            electrical: [
                { name: 'Bright Electric Co', rating: 4.7, distance: '0.8 miles', phone: '(555) 456-7890', email: 'info@brightelectric.com' },
                { name: 'PowerPro Electrical', rating: 4.5, distance: '1.5 miles', phone: '(555) 567-8901', email: 'service@powerpro.com' },
                { name: 'Spark Masters', rating: 4.8, distance: '1.9 miles', phone: '(555) 678-9012', email: 'contact@sparkmasters.com' }
            ],
            hvac: [
                { name: 'Cool Comfort HVAC', rating: 4.6, distance: '1.1 miles', phone: '(555) 789-0123', email: 'info@coolcomfort.com' },
                { name: 'Climate Control Pros', rating: 4.9, distance: '1.7 miles', phone: '(555) 890-1234', email: 'service@climatecontrol.com' },
                { name: 'Air Masters Inc', rating: 4.4, distance: '2.3 miles', phone: '(555) 901-2345', email: 'contact@airmasters.com' }
            ],
            carpentry: [
                { name: 'Precision Woodworks', rating: 4.8, distance: '0.9 miles', phone: '(555) 012-3456', email: 'info@precisionwood.com' },
                { name: 'Master Carpenters', rating: 4.7, distance: '1.4 miles', phone: '(555) 123-4567', email: 'service@mastercarpenters.com' },
                { name: 'Custom Wood Solutions', rating: 4.6, distance: '2.0 miles', phone: '(555) 234-5678', email: 'contact@customwood.com' }
            ],
            painting: [
                { name: 'Perfect Paint Pro', rating: 4.5, distance: '0.7 miles', phone: '(555) 345-6789', email: 'info@perfectpaint.com' },
                { name: 'Color Masters', rating: 4.8, distance: '1.3 miles', phone: '(555) 456-7890', email: 'service@colormasters.com' },
                { name: 'Premier Painting', rating: 4.7, distance: '1.8 miles', phone: '(555) 567-8901', email: 'contact@premierpainting.com' }
            ],
            roofing: [
                { name: 'TopNotch Roofing', rating: 4.9, distance: '1.0 miles', phone: '(555) 678-9012', email: 'info@topnotchroofing.com' },
                { name: 'Secure Roof Solutions', rating: 4.6, distance: '1.6 miles', phone: '(555) 789-0123', email: 'service@secureroof.com' },
                { name: 'Elite Roofing Co', rating: 4.7, distance: '2.2 miles', phone: '(555) 890-1234', email: 'contact@eliteroofing.com' }
            ],
            landscaping: [
                { name: 'Green Thumb Landscaping', rating: 4.8, distance: '0.6 miles', phone: '(555) 901-2345', email: 'info@greenthumb.com' },
                { name: 'Nature\'s Best', rating: 4.5, distance: '1.1 miles', phone: '(555) 012-3456', email: 'service@naturesbest.com' },
                { name: 'Outdoor Oasis', rating: 4.7, distance: '1.9 miles', phone: '(555) 123-4567', email: 'contact@outdooroasis.com' }
            ],
            other: [
                { name: 'HandyPro Services', rating: 4.6, distance: '0.4 miles', phone: '(555) 234-5678', email: 'info@handypro.com' },
                { name: 'Fix-It-All Solutions', rating: 4.4, distance: '1.2 miles', phone: '(555) 345-6789', email: 'service@fixitall.com' },
                { name: 'Complete Home Care', rating: 4.8, distance: '1.7 miles', phone: '(555) 456-7890', email: 'contact@completehome.com' }
            ]
        };

        return mockData[category] || [];
    }

    renderLocalContractors(contractors) {
        const listDiv = document.getElementById('contractors-list');
        
        if (contractors.length === 0) {
            listDiv.innerHTML = '<div class="message info">No contractors found for this category in your area.</div>';
            return;
        }

        const html = contractors.map(contractor => `
            <div class="local-contractor-card">
                <div class="local-contractor-header">
                    <div class="local-contractor-name">${contractor.name}</div>
                    <div class="local-contractor-distance">${contractor.distance}</div>
                </div>
                <div class="local-contractor-info">
                    <div class="local-contractor-rating">
                        ${'★'.repeat(Math.floor(contractor.rating))} ${contractor.rating}
                    </div>
                    <div>${contractor.phone}</div>
                </div>
                <div class="local-contractor-actions">
                    <button class="btn btn-secondary btn-small" onclick="workOrderSystem.addFoundContractor('${contractor.name}', '${contractor.email}', '${contractor.phone}')">
                        <i class="fas fa-plus"></i> Add to Contacts
                    </button>
                    <button class="btn btn-primary btn-small" onclick="workOrderSystem.emailFoundContractor('${contractor.email}')">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                </div>
            </div>
        `).join('');

        listDiv.innerHTML = html;
    }

    addFoundContractor(name, email, phone) {
        const category = document.getElementById('order-category').value;
        
        const contractor = {
            id: 'CONT-' + Date.now(),
            name: name,
            contact: '',
            email: email,
            phone: phone,
            specialties: [category],
            rating: null,
            notes: 'Found via local search',
            createdAt: new Date().toISOString()
        };

        this.contractors.push(contractor);
        this.saveData();
        this.showMessage(`${name} added to your contractors!`, 'success');
    }

    emailFoundContractor(email) {
        const subject = 'Home Maintenance Service Inquiry';
        const body = 'Hello,\n\nI found your services online and would like to inquire about home maintenance work. Please contact me at your earliest convenience.\n\nThank you!';
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
    }

    // Rendering Functions
    renderDashboard() {
        this.updateStats();
        this.renderOrders();
    }

    updateStats() {
        const total = this.orders.length;
        const pending = this.orders.filter(o => o.status === 'pending').length;
        const inProgress = this.orders.filter(o => o.status === 'in-progress' || o.status === 'assigned').length;
        const completed = this.orders.filter(o => o.status === 'completed').length;

        document.getElementById('total-orders').textContent = total;
        document.getElementById('pending-orders').textContent = pending;
        document.getElementById('in-progress-orders').textContent = inProgress;
        document.getElementById('completed-orders').textContent = completed;
    }

    renderOrders() {
        const statusFilter = document.getElementById('status-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        
        let filteredOrders = this.orders;
        
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        
        if (categoryFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.category === categoryFilter);
        }

        const ordersList = document.getElementById('orders-list');
        
        if (filteredOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No Work Orders Found</h3>
                    <p>Create your first work order to get started!</p>
                </div>
            `;
            return;
        }

        // Sort orders by creation date (newest first)
        filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const html = filteredOrders.map(order => this.renderOrderCard(order)).join('');
        ordersList.innerHTML = html;
    }

    renderOrderCard(order) {
        const assignedContractor = order.assignedContractor 
            ? this.contractors.find(c => c.id === order.assignedContractor)
            : null;

        const dueDate = order.dueDate 
            ? new Date(order.dueDate).toLocaleDateString()
            : 'No due date';

        const createdDate = new Date(order.createdAt).toLocaleDateString();

        return `
            <div class="order-card" onclick="workOrderSystem.showOrderDetail('${order.id}')">
                <div class="order-header">
                    <div>
                        <div class="order-title">${order.title}</div>
                        <div class="order-id">${order.id}</div>
                    </div>
                    <div class="order-status ${order.status}">${order.status.replace('-', ' ')}</div>
                </div>
                
                <div class="order-meta">
                    <span class="order-category">${order.category}</span>
                    <span class="order-priority ${order.priority}">${order.priority}</span>
                </div>
                
                <div class="order-description">${order.description}</div>
                
                <div class="order-footer">
                    <div>
                        <div class="order-date">Created: ${createdDate}</div>
                        <div class="order-date">Due: ${dueDate}</div>
                        ${assignedContractor ? `<div class="order-date">Assigned to: ${assignedContractor.name}</div>` : ''}
                    </div>
                    <div class="order-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-secondary btn-small" onclick="workOrderSystem.showOrderDetail('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="workOrderSystem.deleteOrder('${order.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showOrderDetail(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const assignedContractor = order.assignedContractor 
            ? this.contractors.find(c => c.id === order.assignedContractor)
            : null;

        const contractorsForCategory = this.contractors.filter(c => 
            c.specialties.includes(order.category) || c.specialties.includes('other')
        );

        const contractorOptions = contractorsForCategory.map(c => 
            `<option value="${c.id}" ${c.id === order.assignedContractor ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        const statusOptions = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled']
            .map(status => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status.replace('-', ' ')}</option>`)
            .join('');

        const content = `
            <div class="order-detail-header">
                <div class="order-detail-title">${order.title}</div>
                <div class="order-detail-meta">
                    <span class="order-category">${order.category}</span>
                    <span class="order-priority ${order.priority}">${order.priority}</span>
                    <span class="order-status ${order.status}">${order.status.replace('-', ' ')}</span>
                </div>
            </div>

            <div class="order-detail-section">
                <h4>Description</h4>
                <p>${order.description}</p>
            </div>

            <div class="order-detail-section">
                <h4>Details</h4>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Location:</strong> ${order.location}</p>
                <p><strong>Budget:</strong> $${order.budget.toFixed(2)}</p>
                <p><strong>Due Date:</strong> ${order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'Not set'}</p>
                <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> ${new Date(order.updatedAt).toLocaleDateString()}</p>
            </div>

            ${assignedContractor ? `
                <div class="order-detail-section">
                    <h4>Assigned Contractor</h4>
                    <p><strong>Company:</strong> ${assignedContractor.name}</p>
                    <p><strong>Contact:</strong> ${assignedContractor.contact}</p>
                    <p><strong>Email:</strong> ${assignedContractor.email}</p>
                    <p><strong>Phone:</strong> ${assignedContractor.phone}</p>
                </div>
            ` : ''}

            <div class="order-detail-actions">
                <div class="contractor-assign">
                    <label>Status:</label>
                    <select id="order-status-select">
                        ${statusOptions}
                    </select>
                    <button class="btn btn-secondary" onclick="workOrderSystem.updateOrderStatus('${order.id}', document.getElementById('order-status-select').value)">
                        Update Status
                    </button>
                </div>

                <div class="contractor-assign">
                    <label>Assign Contractor:</label>
                    <select id="contractor-select">
                        <option value="">Select Contractor</option>
                        ${contractorOptions}
                    </select>
                    <button class="btn btn-secondary" onclick="workOrderSystem.assignContractor('${order.id}', document.getElementById('contractor-select').value)">
                        Assign
                    </button>
                </div>

                ${assignedContractor ? `
                    <button class="btn btn-primary" onclick="workOrderSystem.openEmailModal('${assignedContractor.id}', '${order.id}')">
                        <i class="fas fa-envelope"></i> Email Contractor
                    </button>
                ` : ''}
            </div>
        `;

        document.getElementById('order-detail-content').innerHTML = content;
        this.showModal('order-modal');
    }

    renderContractors() {
        const contractorsGrid = document.getElementById('contractors-grid');
        
        if (this.contractors.length === 0) {
            contractorsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Contractors Added</h3>
                    <p>Add contractors to easily assign work orders and manage contacts.</p>
                </div>
            `;
            return;
        }

        const html = this.contractors.map(contractor => this.renderContractorCard(contractor)).join('');
        contractorsGrid.innerHTML = html;
    }

    renderContractorCard(contractor) {
        const rating = contractor.rating 
            ? '★'.repeat(contractor.rating) + '☆'.repeat(5 - contractor.rating)
            : 'Not rated';

        const specialties = contractor.specialties.map(s => 
            `<span class="specialty-tag">${s}</span>`
        ).join('');

        return `
            <div class="contractor-card">
                <div class="contractor-header">
                    <div class="contractor-name">${contractor.name}</div>
                    <div class="contractor-rating">${rating}</div>
                </div>
                
                <div class="contractor-contact">${contractor.contact}</div>
                <div class="contractor-contact">${contractor.email}</div>
                <div class="contractor-contact">${contractor.phone}</div>
                
                <div class="contractor-specialties">
                    ${specialties}
                </div>
                
                ${contractor.notes ? `<div class="contractor-notes">${contractor.notes}</div>` : ''}
                
                <div class="contractor-actions">
                    <button class="btn btn-primary btn-small" onclick="workOrderSystem.openEmailModal('${contractor.id}')">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                    <button class="btn btn-danger btn-small" onclick="workOrderSystem.deleteContractor('${contractor.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Settings Management
    saveEmailSettings(form) {
        const formData = new FormData(form);
        this.settings.userEmail = formData.get('userEmail');
        this.settings.emailTemplate = formData.get('emailTemplate');
        
        localStorage.setItem('settings', JSON.stringify(this.settings));
        this.showMessage('Email settings saved successfully!', 'success');
    }

    loadSettings() {
        if (this.settings.userEmail) {
            document.getElementById('user-email').value = this.settings.userEmail;
        }
        if (this.settings.emailTemplate) {
            document.getElementById('email-template').value = this.settings.emailTemplate;
        }
    }

    // Data Management
    saveData() {
        localStorage.setItem('workOrders', JSON.stringify(this.orders));
        localStorage.setItem('contractors', JSON.stringify(this.contractors));
    }

    exportData() {
        const data = {
            orders: this.orders,
            contractors: this.contractors,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dasboot-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Data exported successfully!', 'success');
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.orders) this.orders = data.orders;
                if (data.contractors) this.contractors = data.contractors;
                if (data.settings) this.settings = data.settings;
                
                this.saveData();
                this.loadSettings();
                this.renderDashboard();
                this.renderContractors();
                
                this.showMessage('Data imported successfully!', 'success');
            } catch (error) {
                this.showMessage('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        localStorage.removeItem('workOrders');
        localStorage.removeItem('contractors');
        localStorage.removeItem('settings');
        
        this.orders = [];
        this.contractors = [];
        this.settings = {};
        
        this.renderDashboard();
        this.renderContractors();
        this.loadSettings();
        
        this.showMessage('All data cleared successfully!', 'success');
    }

    // Utility Functions
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert at the top of the current tab content
        const activeTab = document.querySelector('.tab-content.active');
        activeTab.insertBefore(messageDiv, activeTab.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    setMinDate() {
        // Set minimum date for due date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('order-due-date').min = today;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workOrderSystem = new WorkOrderSystem();
});

// Add some sample data for demonstration
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Add sample contractors if none exist
        if (workOrderSystem.contractors.length === 0) {
            const sampleContractors = [
                {
                    id: 'CONT-sample1',
                    name: 'QuickFix Plumbing',
                    contact: 'John Smith',
                    email: 'john@quickfixplumbing.com',
                    phone: '(555) 123-4567',
                    specialties: ['plumbing'],
                    rating: 5,
                    notes: 'Reliable and fast service',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'CONT-sample2',
                    name: 'Bright Electric Co',
                    contact: 'Sarah Johnson',
                    email: 'sarah@brightelectric.com',
                    phone: '(555) 234-5678',
                    specialties: ['electrical'],
                    rating: 4,
                    notes: 'Licensed electrician, emergency services',
                    createdAt: new Date().toISOString()
                }
            ];

            workOrderSystem.contractors = sampleContractors;
            workOrderSystem.saveData();
            workOrderSystem.renderContractors();
        }

        // Add sample work order if none exist
        if (workOrderSystem.orders.length === 0) {
            const sampleOrder = {
                id: 'WO-sample1',
                title: 'Leaky Kitchen Faucet',
                category: 'plumbing',
                priority: 'medium',
                description: 'Kitchen faucet has been dripping constantly. Needs repair or replacement.',
                location: 'Kitchen',
                budget: 150,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
                status: 'pending',
                assignedContractor: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                notes: []
            };

            workOrderSystem.orders = [sampleOrder];
            workOrderSystem.saveData();
            workOrderSystem.renderDashboard();
        }
    }, 1000);

    // Header DateTime Functionality
    function updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        
        const dateTimeString = now.toLocaleDateString('en-US', options);
        const parts = dateTimeString.split(',');
        const dayOfWeek = parts[0]; // "Wed"
        const dateOnly = parts[1].trim(); // "Jun 25, 2025"
        const timeOnly = dateTimeString.split(' ').slice(-2).join(' '); // "2:20:34 AM"
        
        document.getElementById('header-datetime').innerHTML = `
            <span style="font-weight: 500;">${dayOfWeek}</span>
            <span style="opacity: 0.9;">${dateOnly}</span>
            <span style="opacity: 0.9;">${timeOnly}</span>
        `;
    }
    
    // Update datetime immediately and then every second
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // README Modal Functionality
    const readmeBtn = document.getElementById('readme-btn');
    const readmeModal = document.getElementById('readme-modal');
    const closeReadmeModal = document.getElementById('close-readme-modal');
    const readmeContent = document.getElementById('readme-content');

    readmeBtn.addEventListener('click', async () => {
        showReadmeModal();
    });

    closeReadmeModal.addEventListener('click', () => {
        readmeModal.classList.remove('show');
    });

    // Close modal when clicking outside
    readmeModal.addEventListener('click', (e) => {
        if (e.target === readmeModal) {
            readmeModal.classList.remove('show');
        }
    });

    async function showReadmeModal() {
        readmeModal.classList.add('show');
        
        // Load README content
        try {
            const response = await fetch('README.md');
            if (response.ok) {
                const readmeText = await response.text();
                readmeContent.innerHTML = parseMarkdown(readmeText);
            } else {
                // Fallback to inline README content
                readmeContent.innerHTML = getInlineReadme();
            }
        } catch (error) {
            // Fallback to inline README content
            readmeContent.innerHTML = getInlineReadme();
        }
    }

    function parseMarkdown(markdown) {
        // Simple markdown parser for basic elements
        let html = markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gim, '<p>$1</p>')
            .replace(/<p><li>/g, '<ul><li>')
            .replace(/<\/li><\/p>/g, '</li></ul>')
            .replace(/<p><h([1-6])>/g, '<h$1>')
            .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
            .replace(/<p><\/p>/g, '')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        return html;
    }

    function getInlineReadme() {
        return `
            <h1>DasBoot Work Order Ticketing System</h1>
            
            <p>A comprehensive web-based home maintenance work order management system built by <strong>FABREulous Technology</strong>.</p>
            
            <h2>🏠 Overview</h2>
            <p>DasBoot is a modern, responsive work order ticketing system designed for managing home maintenance issues. It provides an intuitive interface for creating, tracking, and managing maintenance requests while maintaining contractor relationships and communication.</p>
            
            <h2>✨ Features</h2>
            
            <h3>📊 Dashboard</h3>
            <ul>
                <li><strong>Real-time statistics</strong> showing total orders, pending, in-progress, and completed work</li>
                <li><strong>Order filtering</strong> by status and category</li>
                <li><strong>Visual status indicators</strong> with color-coded priority levels</li>
                <li><strong>Recent orders overview</strong> with quick access to details</li>
            </ul>
            
            <h3>📝 Work Order Management</h3>
            <ul>
                <li><strong>Create new work orders</strong> with detailed information</li>
                <li><strong>Status tracking</strong> from creation to completion</li>
                <li><strong>Order assignment</strong> to contractors</li>
                <li><strong>Detailed order views</strong> with full history</li>
            </ul>
            
            <h3>👷 Contractor Management</h3>
            <ul>
                <li><strong>Add and manage contractors</strong> with complete profiles</li>
                <li><strong>Contractor directory</strong> with search and filtering</li>
                <li><strong>Local contractor search</strong> simulation for finding new contractors</li>
                <li><strong>Easy contractor assignment</strong> to work orders</li>
            </ul>
            
            <h3>📧 Communication Features</h3>
            <ul>
                <li><strong>Email integration</strong> using mailto links</li>
                <li><strong>Customizable email templates</strong> for contractor communication</li>
                <li><strong>Automated email composition</strong> with work order details</li>
                <li><strong>Template variables</strong> for personalized messages</li>
            </ul>
            
            <h3>🔧 Data Management</h3>
            <ul>
                <li><strong>Local storage persistence</strong> for offline capability</li>
                <li><strong>Export/Import functionality</strong> for data portability</li>
                <li><strong>Data backup and restore</strong> capabilities</li>
                <li><strong>Clear data option</strong> with confirmation prompts</li>
            </ul>
            
            <h2>🚀 Getting Started</h2>
            
            <h3>Installation</h3>
            <ol>
                <li>Clone or download the project files</li>
                <li>Ensure you have the following files in your directory:
                    <ul>
                        <li><code>index.html</code> - Main application file</li>
                        <li><code>styles.css</code> - Styling and responsive design</li>
                        <li><code>script.js</code> - Application logic and functionality</li>
                    </ul>
                </li>
            </ol>
            
            <h3>Running the Application</h3>
            <ol>
                <li>Open <code>index.html</code> in any modern web browser</li>
                <li>The application runs entirely client-side (no server required)</li>
                <li>Data is automatically saved to browser local storage</li>
            </ol>
            
            <h3>First Use</h3>
            <ol>
                <li>Navigate to the <strong>Contractors</strong> tab to add your preferred contractors</li>
                <li>Use <strong>New Order</strong> tab to create your first work order</li>
                <li>Assign contractors and track progress from the <strong>Dashboard</strong></li>
            </ol>
            
            <h2>🎨 Technologies Used</h2>
            <ul>
                <li><strong>HTML5</strong> - Semantic markup and structure</li>
                <li><strong>CSS3</strong> - Modern styling with Grid, Flexbox, and animations</li>
                <li><strong>Vanilla JavaScript</strong> - No external dependencies</li>
                <li><strong>Font Awesome</strong> - Icon library for enhanced UI</li>
                <li><strong>Local Storage API</strong> - Client-side data persistence</li>
            </ul>
            
            <h2>📧 Support and Contact</h2>
            <p><strong>FABREulous Technology</strong><br>
Copyright © 2025 FABREulous Technology<br>
All rights reserved</p>
            
            <hr>
            <p><em>Built with ❤️ by FABREulous Technology</em></p>
        `;
    }
});
