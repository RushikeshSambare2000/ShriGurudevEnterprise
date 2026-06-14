/* ==========================================================================
   SHREE GURUDEV ENTERPRISES - Invoice & Quotation Generator
   Pure HTML/CSS/Bootstrap/JavaScript (No Database)
   ========================================================================== */

// ===== STATE =====
let currentTab = 'quotation'; // 'quotation' or 'invoice'
let itemCounter = 0;

// ===== COMPANY INFO (constants) =====
const COMPANY = {
    name: 'SHREE GURUDEV ENTERPRISES',
    tagline: 'Core Cutting, All Type Of Breaking Work & All type of Rebaring work',
    contact: 'Contractor : Sunil Patil, Mo.No : 8888352558 Email : sunilpatil1472@gmail.com',
    address: 'Sr. No. 2441/15, Lavale Phata, Balajinagar, Pirangut Tal-Mulshi, Dist-Pune 412115',
    img1: 'ref/img1.jpg',
    img2: 'ref/img2.jpg',
    shortName: 'S.G.ENTERPRISES'
};

// ===== TERMS =====
const QUOTATION_TERMS = [
    'Work will be start against proper work order.',
    '15% advance along with conformation of order.',
    '85% after completion of work.',
    'Measurements will be measured at actual as per site execution.',
    'Power supply required for the work shall be supplied by you free of cost.'
];

const INVOICE_TERMS = [
    'All payments should be made in favor of SHREE GURUDEV ENTERPRISES.',
    'Discrepancies if any, should be reported within 3 days of invoice receipt.'
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('docDate').value = today;
    document.getElementById('footerYear').textContent = new Date().getFullYear();

    // Add initial item row
    addItem();

    // Set default tab
    switchTab('quotation');
});

// ===== TAB SWITCHING =====
function switchTab(tab) {
    currentTab = tab;

    const btnQ = document.getElementById('btnShowQuotation');
    const btnI = document.getElementById('btnShowInvoice');
    const titleEl = document.getElementById('formTitle');
    const docLabel = document.getElementById('docNumberLabel');
    const invoiceFields = document.getElementById('invoiceExtraFields');
    const quotationFields = document.getElementById('quotationExtraFields');
    const discountInvoice = document.getElementById('discountSection');
    const discountQuotation = document.getElementById('discountSectionQuotation');

    if (tab === 'quotation') {
        btnQ.classList.add('active');
        btnI.classList.remove('active');
        titleEl.innerHTML = '<i class="bi bi-file-earmark-text"></i> Create Quotation';
        docLabel.innerHTML = 'Quotation No <span class="text-danger">*</span>';
        document.getElementById('docNumber').placeholder = 'e.g. QT-2026-0001';
        invoiceFields.style.display = 'none';
        quotationFields.style.display = '';
        discountInvoice.style.display = 'none';
        discountQuotation.style.display = '';
    } else {
        btnI.classList.add('active');
        btnQ.classList.remove('active');
        titleEl.innerHTML = '<i class="bi bi-receipt"></i> Create Invoice';
        docLabel.innerHTML = 'Invoice No <span class="text-danger">*</span>';
        document.getElementById('docNumber').placeholder = 'e.g. INV-2026-0001';
        invoiceFields.style.display = '';
        quotationFields.style.display = 'none';
        discountInvoice.style.display = '';
        discountQuotation.style.display = 'none';
    }
}

// ===== ADD ITEM ROW =====
function addItem() {
    itemCounter++;
    const tbody = document.getElementById('itemsBody');
    const tr = document.createElement('tr');
    tr.id = `item-row-${itemCounter}`;
    tr.innerHTML = `
        <td class="text-center fw-semibold item-sr">${tbody.children.length + 1}</td>
        <td>
            <input type="text" class="form-control form-control-sm" placeholder="e.g. Core Cutting 10&quot; (250 mm Dai)" data-field="description">
        </td>
        <td>
            <select class="form-select form-select-sm" data-field="workType">
                <option value="HORIZONTAL">HORIZONTAL</option>
                <option value="VERTICAL">VERTICAL</option>
                <option value="CEILING">CEILING</option>
                <option value="OTHER">OTHER</option>
            </select>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm text-center" placeholder="0" data-field="depth" min="0" step="0.1" oninput="calculateRowAmount(this)">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm text-center" placeholder="0" data-field="qty" min="0" step="0.1" oninput="calculateRowAmount(this)">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm text-end" placeholder="0.00" data-field="rate" min="0" step="0.01" oninput="calculateRowAmount(this)">
        </td>
        <td>
            <input type="text" class="form-control form-control-sm text-end fw-semibold" data-field="amount" readonly value="0.00" style="background:rgba(230,81,0,0.08);border-color:rgba(230,81,0,0.2);color:#ff8a50;">
        </td>
        <td class="text-center">
            <button class="btn-remove-row" onclick="removeItem('item-row-${itemCounter}')" title="Remove">
                <i class="bi bi-trash3"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);

    // Animate in
    tr.style.opacity = '0';
    tr.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
        tr.style.transition = 'all 0.3s ease-out';
        tr.style.opacity = '1';
        tr.style.transform = 'translateY(0)';
    });
}

// ===== REMOVE ITEM ROW =====
function removeItem(rowId) {
    const tbody = document.getElementById('itemsBody');
    if (tbody.children.length <= 1) {
        showToast('At least one item is required.', 'error');
        return;
    }
    const row = document.getElementById(rowId);
    if (row) {
        row.style.transition = 'all 0.3s ease-in';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => {
            row.remove();
            reindexItems();
            calculateTotals();
        }, 300);
    }
}

// ===== REINDEX SERIAL NUMBERS =====
function reindexItems() {
    const rows = document.querySelectorAll('#itemsBody tr');
    rows.forEach((row, idx) => {
        const srCell = row.querySelector('.item-sr');
        if (srCell) srCell.textContent = idx + 1;
    });
}

// ===== CALCULATE ROW AMOUNT =====
function calculateRowAmount(inputEl) {
    const row = inputEl.closest('tr');
    const qty = parseFloat(row.querySelector('[data-field="qty"]').value) || 0;
    const rate = parseFloat(row.querySelector('[data-field="rate"]').value) || 0;
    const depth = parseFloat(row.querySelector('[data-field="depth"]').value) || 0;
    const amount = qty * depth * rate;
    row.querySelector('[data-field="amount"]').value = amount.toFixed(2);
    calculateTotals();
}

// ===== CALCULATE TOTALS =====
function calculateTotals() {
    // This is used internally for validation; actual totals are computed in PDF generation.
}

// ===== COLLECT FORM DATA =====
function collectFormData() {
    const data = {
        type: currentTab,
        customerName: document.getElementById('customerName').value.trim(),
        customerAddress: document.getElementById('customerAddress').value.trim(),
        customerMobile: document.getElementById('customerMobile').value.trim(),
        customerGST: document.getElementById('customerGST').value.trim(),
        docNumber: document.getElementById('docNumber').value.trim(),
        docDate: document.getElementById('docDate').value,
        items: []
    };

    if (currentTab === 'invoice') {
        data.refQuotation = document.getElementById('refQuotation').value.trim();
        data.paymentStatus = document.getElementById('paymentStatus').value;
        data.paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
        // data.gstPercent = parseFloat(document.getElementById('gstPercent').value) ||0;
        data.discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    } else {
        data.quotationStatus = document.getElementById('quotationStatus').value;
        data.discount = parseFloat(document.getElementById('discountAmountQuotation').value) || 0;
    }

    // Collect items
    const rows = document.querySelectorAll('#itemsBody tr');
    rows.forEach((row, idx) => {
        const desc = row.querySelector('[data-field="description"]').value.trim();
        const workType = row.querySelector('[data-field="workType"]').value;
        const depth = parseFloat(row.querySelector('[data-field="depth"]').value) || 0;
        const qty = parseFloat(row.querySelector('[data-field="qty"]').value) || 0;
        const rate = parseFloat(row.querySelector('[data-field="rate"]').value) || 0;
        const amount = qty * depth * rate;

        data.items.push({
            sr: idx + 1,
            description: desc,
            workType: workType,
            depth: depth,
            qty: qty,
            rate: rate,
            amount: amount
        });
    });

    return data;
}

// ===== VALIDATE =====
function validateForm(data) {
    if (!data.customerName) {
        showToast('Please enter customer name.', 'error');
        document.getElementById('customerName').focus();
        return false;
    }
    if (!data.docNumber) {
        showToast('Please enter document number.', 'error');
        document.getElementById('docNumber').focus();
        return false;
    }
    if (!data.docDate) {
        showToast('Please select a date.', 'error');
        document.getElementById('docDate').focus();
        return false;
    }
    if (data.items.length === 0 || !data.items[0].description) {
        showToast('Please add at least one item with a description.', 'error');
        return false;
    }
    for (let i = 0; i < data.items.length; i++) {
        if (!data.items[i].description) {
            showToast(`Please enter description for item ${i + 1}.`, 'error');
            return false;
        }
    }
    return true;
}

// ===== GENERATE PDF HTML =====
function generatePDFHTML(data) {
    // Calculate totals
    let subtotal = 0;
    data.items.forEach(item => { subtotal += item.amount; });

    const discount = data.discount || 0;

    let totalsHTML = '';
    if (data.type === 'invoice') {
        const gstPercent = data.gstPercent || 18;
        const afterDiscount = subtotal - discount;
        const gstAmount = afterDiscount * (gstPercent / 100);
        const grandTotal = afterDiscount;
        const paidAmount = data.paidAmount || 0;
        const remaining = grandTotal - paidAmount;

        totalsHTML = `
            <tr>
                <td class="total-label">Subtotal:</td>
                <td class="total-value">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td class="total-label">Discount:</td>
                <td class="total-value">${discount.toFixed(2)}</td>
            </tr>
        
            <tr class="grand-total">
                <td class="total-label">Grand Total:</td>
                <td class="total-value">${grandTotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td class="total-label">Paid Amount:</td>
                <td class="total-value">${paidAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td class="total-label" style="font-weight:700;color:#e65100;">Remaining Amount:</td>
                <td class="total-value" style="font-weight:700;color:#e65100;">${remaining.toFixed(2)}</td>
            </tr>
        `;
    } else {
        const totalAmount = subtotal - discount;
        totalsHTML = `
            <tr>
                <td class="total-label">Subtotal:</td>
                <td class="total-value">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td class="total-label">Discount:</td>
                <td class="total-value">${discount.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
                <td class="total-label">Total Amount:</td>
                <td class="total-value">${totalAmount.toFixed(2)}</td>
            </tr>
        `;
    }

    // Items rows
    let itemsRowsHTML = '';
    data.items.forEach(item => {
        itemsRowsHTML += `
            <tr>
                <td>${item.sr}</td>
                <td>${item.description}</td>
                <td>${item.workType}</td>
                <td>${item.depth.toFixed(1)}</td>
                <td>${item.qty.toFixed(1)}</td>
                <td>${item.rate.toFixed(2)}</td>
                <td>${item.amount.toFixed(2)}</td>
            </tr>
        `;
    });

    // Info section (left & right)
    let infoLeftHTML = '';
    let infoRightHTML = '';

    if (data.type === 'quotation') {
        infoLeftHTML = `
            <div><span class="pdf-info-label">To,</span></div>
            <div><strong>${data.customerName}</strong></div>
            ${data.customerAddress ? `<div>Address: ${data.customerAddress}</div>` : ''}
            ${data.customerMobile ? `<div>Mobile: ${data.customerMobile}</div>` : ''}
            ${data.customerGST ? `<div>GST: ${data.customerGST}</div>` : ''}
        `;
        infoRightHTML = `
            <div><span class="pdf-info-label">Quotation No:</span> ${data.docNumber}</div>
            <div><span class="pdf-info-label">Date:</span> ${data.docDate}</div>
            <div><span class="pdf-info-label">Status:</span> ${data.quotationStatus || 'PENDING'}</div>
        `;
    } else {
        infoLeftHTML = `
            <div><span class="pdf-info-label">Billed To,</span></div>
            <div><strong>${data.customerName}</strong></div>
            ${data.customerAddress ? `<div>Address: ${data.customerAddress}</div>` : ''}
            ${data.customerMobile ? `<div>Mobile: ${data.customerMobile}</div>` : ''}
            ${data.customerGST ? `<div>GST: ${data.customerGST}</div>` : ''}
        `;
        infoRightHTML = `
            <div><span class="pdf-info-label">Invoice No:</span> ${data.docNumber}</div>
            <div><span class="pdf-info-label">Date:</span> ${data.docDate}</div>
            ${data.refQuotation ? `<div><span class="pdf-info-label">Ref Quotation:</span> ${data.refQuotation}</div>` : ''}
            <div><span class="pdf-info-label">Payment Status:</span> ${data.paymentStatus || 'PENDING'}</div>
        `;
    }

    // Terms
    const terms = data.type === 'invoice' ? INVOICE_TERMS : QUOTATION_TERMS;
    let termsHTML = terms.map((t, i) => `<div>${i + 1}) ${t}</div>`).join('');

    // Document title
    const docTitle = data.type === 'invoice' ? 'TAX INVOICE' : 'QUOTATION';

    // Convert images to absolute paths for html2pdf
    const img1Path = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + COMPANY.img1;
    const img2Path = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + COMPANY.img2;

    return `
        <div class="pdf-page" id="pdfPageContent">
            <!-- HEADER -->
            <div class="pdf-header">
                <div class="pdf-header-images">
                    <img src="${img2Path}" alt="Ganesh">
                    <div>
                        <div class="pdf-company-name">${COMPANY.name}</div>
                        <div class="pdf-company-desc">${COMPANY.tagline}</div>
                    </div>
                    <img src="${img1Path}" alt="Gurudev">
                </div>
                <div class="pdf-company-contact">${COMPANY.contact}</div>
                <div class="pdf-company-address">${COMPANY.address}</div>
            </div>

            <hr class="pdf-divider">

            <!-- TITLE -->
            <div class="pdf-doc-title">${docTitle}</div>

            <!-- INFO SECTION -->
            <div class="pdf-info-section">
                <div class="pdf-info-left">${infoLeftHTML}</div>
                <div class="pdf-info-right">${infoRightHTML}</div>
            </div>

            <!-- ITEMS TABLE -->
            <table class="pdf-items-table">
                <thead>
                    <tr>
                        <th style="width:40px">Sr.No.</th>
                        <th>Service Description</th>
                        <th style="width:90px">Work Type</th>
                        <th style="width:70px">Depth(in)</th>
                        <th style="width:50px">Qty</th>
                        <th style="width:70px">Rate</th>
                        <th style="width:80px">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRowsHTML}
                </tbody>
            </table>

            <!-- TOTALS -->
            <div class="pdf-totals">
                <table class="pdf-totals-table">
                    ${totalsHTML}
                </table>
            </div>

            <!-- TERMS -->
            <div class="pdf-terms">
                <h4>Terms And Conditions:</h4>
                ${termsHTML}
            </div>

            <!-- FOOTER -->
            <div class="pdf-footer-section">
                <div class="pdf-thanking">Thanking You</div>
                <div class="pdf-signatory">
                    <div class="for-line">For ${COMPANY.shortName}</div>
                    <div class="sign-line">Authorised Signatory</div>
                </div>
            </div>
        </div>
    `;
}

// ===== PREVIEW =====
function previewDocument() {
    const data = collectFormData();
    if (!validateForm(data)) return;

    const html = generatePDFHTML(data);
    const modalBody = document.getElementById('previewModalBody');
    modalBody.innerHTML = `<div style="display:flex;justify-content:center;background:#e0e0e0;padding:20px;border-radius:8px;">${html}</div>`;

    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();

    showToast('Preview generated successfully!', 'success');
}

// ===== DOWNLOAD PDF =====
// ===== DOWNLOAD PDF =====
function downloadPDF() {
    const data = collectFormData();
    if (!validateForm(data)) return;

    const html = generatePDFHTML(data);
    const container = document.getElementById('pdfContainer');
    container.innerHTML = html;

    // Temporarily inject the container cleanly into view for capture
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '9999';
    container.style.opacity = '1';

    const element = container.querySelector('.pdf-page');
    const filename = data.type === 'invoice'
        ? `invoice_${data.docNumber}.pdf`
        : `quotation_${data.docNumber}.pdf`;

    const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            scrollY: 0,
            scrollX: 0
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    showToast('Generating PDF... Please wait.', 'success');

    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            // Restore hidden container state safely
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.opacity = '';
            container.style.zIndex = '';
            container.innerHTML = '';
            showToast(`${filename} downloaded successfully!`, 'success');
        })
        .catch(err => {
            console.error('PDF generation error:', err);
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            showToast('Error generating PDF. Please try again.', 'error');
        });
}

    showToast('Generating PDF... Please wait.', 'success');

    html2pdf().set(opt).from(element).save().then(() => {
        // Restore container
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.opacity = '';
        container.style.zIndex = '';
        container.innerHTML = '';

        showToast(`${filename} downloaded successfully!`, 'success');
    }).catch(err => {
        console.error('PDF generation error:', err);
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        showToast('Error generating PDF. Please try again.', 'error');
    });


// ===== RESET FORM =====
function resetForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerMobile').value = '';
    document.getElementById('customerGST').value = '';
    document.getElementById('docNumber').value = '';
    document.getElementById('docDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('refQuotation').value = '';
    document.getElementById('paymentStatus').value = 'PENDING';
    document.getElementById('paidAmount').value = '0';
    document.getElementById('gstPercent').value = '18';
    document.getElementById('discountAmount').value = '0';
    document.getElementById('discountAmountQuotation').value = '0';
    document.getElementById('quotationStatus').value = 'PENDING';

    // Reset items
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';
    itemCounter = 0;
    addItem();

    showToast('Form reset successfully.', 'success');
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    toast.innerHTML = `<i class="bi ${icon}"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s ease-in forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
