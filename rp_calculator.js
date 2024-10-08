let webhookURL = 'PLACEHOLDER_FOR_WEBHOOK_URL'; // testing

// This function updates the webhookURL value with your actual webhook URL
function updateWebhookURL(url) {
    webhookURL = url;
}

let items = [];
let totalRP = 0;
let existingVP = 0;
let vpPackages = [];

// Function to fetch VP packages from the JSON file (for browser)
async function fetchVPPackages() {
    try {
        const response = await fetch('vpPackages.json');
        vpPackages = await response.json();
        console.log('VP Packages fetched:', vpPackages);
    } catch (error) {
        console.error('Error fetching VP packages:', error);
    }
}

// Browser-specific event listeners and operations
if (typeof window !== 'undefined') {
    // Call the function to fetch VP packages on page load
    fetchVPPackages();

    // DOM manipulation and interaction
    document.addEventListener('DOMContentLoaded', function() {
        const addItemButton = document.getElementById('addItemButton');
        const currencySelect = document.getElementById('currency');
        const existingVPInput = document.getElementById('existingVP');
        const feedbackButton = document.getElementById('feedbackButton');
        const feedbackTooltip = document.createElement('span');

        // Show notification on page load
        setTimeout(() => {
            showNotification(
                'Made by twitch.tv/antiparty',
                'https://static-cdn.jtvnw.net/jtv_user_pictures/51a63b23-bb89-41be-ba7b-5a145a1a7bf6-profile_image-70x70.png',
                'https://twitch.tv/antiparty'
            );
        }, 10000);

        // Add item button click event
        addItemButton.addEventListener('click', function() {
            addItem();
            showNotification('Item added successfully!');
            calculateVP();  // Trigger VP calculation
        });

        // Currency select change event
        currencySelect.addEventListener('change', function() {
            if (totalRP > 0) {
                calculateVP();
            }
        });

        // Existing VP input event
        existingVPInput.addEventListener('input', function() {
            existingVP = parseFloat(existingVPInput.value) || 0;
            if (totalRP > 0) {
                calculateVP();
            }
        });

        // Feedback button tooltip and disable functionality
        feedbackTooltip.className = 'tooltiptext';
        feedbackTooltip.textContent = 'Out of use';
        feedbackButton.classList.add('tooltip');
        feedbackButton.appendChild(feedbackTooltip);
        feedbackButton.disabled = true;

        feedbackButton.addEventListener('click', function() {
            document.getElementById('feedbackModal').style.display = 'block';
        });

        document.querySelector('.close').addEventListener('click', function() {
            document.getElementById('feedbackModal').style.display = 'none';
        });

        document.getElementById('feedbackForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const feedback = document.getElementById('feedback').value;
            sendFeedback(feedback);
            alert('Thank you for your feedback!');
            document.getElementById('feedbackModal').style.display = 'none';
        });
    });
}

// Function to add an item (for browser)
function addItem() {
    let rpCost = document.getElementById('itemCost').value.trim();
    let currency = document.getElementById('currency').value;

    if (rpCost === '' || currency === 'none') {
        alert('Please enter RP cost and select a currency.');
        return;
    }

    items.push(parseFloat(rpCost));
    totalRP += parseFloat(rpCost);
    updateItemList();
    updateTotalRP(totalRP);
    calculateVP();  // Trigger VP calculation when item is added
}

// Function to update the item list (for browser)
function updateItemList() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';

    items.forEach((cost, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Item ${index + 1}: ${cost} RP`;
        itemList.appendChild(listItem);
    });
}

// Function to update the total RP (for browser)
function updateTotalRP(totalRP) {
    document.getElementById('totalRPValue').textContent = totalRP.toFixed(0);
}

// Function to calculate VP (for browser)
function calculateVP() {
    let vpNeeded = Math.max(totalRP - existingVP, 0);
    let selectedPackages = [];
    let totalCost = 0;
    const selectedCurrency = document.getElementById('currency').value;

    // Check if currency is selected
    if (selectedCurrency === 'none') {
        alert('Please select a currency.');
        return;
    }

    let bonusSP = 0; // Accumulate bonus SP

    // Process packages to get the required VP
    for (let i = vpPackages.length - 1; i >= 0; i--) {
        while (vpNeeded >= vpPackages[i].vp) {
            vpNeeded -= vpPackages[i].vp;
            selectedPackages.push(vpPackages[i]);
            totalCost += vpPackages[i].costs[selectedCurrency];
            bonusSP += vpPackages[i].bonus_sp;
        }
    }

    if (vpNeeded > 0) {
        // Add the smallest package if remaining VP is needed
        selectedPackages.push(vpPackages[0]);
        totalCost += vpPackages[0].costs[selectedCurrency];
        bonusSP += vpPackages[0].bonus_sp;
    }

    updateTotalVP(selectedPackages, bonusSP);
    updateVPPackages(selectedPackages, totalCost, selectedCurrency, bonusSP);
}

// Function to update total VP (for browser)
function updateTotalVP(packages, bonusSP) {
    const totalVP = packages.reduce((total, pkg) => total + pkg.vp, 0) + bonusSP;
    document.getElementById('totalVPValue').textContent = totalVP.toFixed(2);
}

// Function to update VP packages display (for browser)
function updateVPPackages(packages, totalCost, currency, bonusSP) {
    const vpPackagesDiv = document.getElementById('vpPackages');
    vpPackagesDiv.innerHTML = '';

    packages.forEach(pkg => {
        const packageElement = document.createElement('p');
        packageElement.textContent = `${pkg.vp} SP - ${currency} ${pkg.costs[currency].toFixed(2)}`;
        vpPackagesDiv.appendChild(packageElement);
    });

    // Calculate total bonus SP
    const styledBonusSP = `<span style="color: yellow;">${bonusSP}</span>`;

    // Add the total cost with bonus SP and color styling
    const totalCostElement = document.createElement('p');
    totalCostElement.innerHTML = `Total Cost: <span class="total-cost">${currency} ${totalCost.toFixed(2)}</span> + bonus SP ${styledBonusSP}`;
    vpPackagesDiv.appendChild(totalCostElement);

    // Add animation to total cost
    const totalCostSpan = totalCostElement.querySelector('.total-cost');
    totalCostSpan.classList.add('highlight');
    setTimeout(() => totalCostSpan.classList.remove('highlight'), 1000);
}

// Function to reset the calculator (for browser)
function resetCalculator() {
    items = [];
    totalRP = 0;
    existingVP = 0;
    document.getElementById('existingVP').value = '';
    updateItemList();
    updateTotalRP(0);
    updateVPPackages([], 0, 'USD'); // Reset to USD by default
}

// Function to send feedback to Discord via webhook
async function sendFeedback(feedback) {
    try {
        if (!webhookURL || webhookURL === '') {
            throw new Error('Webhook URL is not defined.');
        }

        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: `**User Feedback:** ${feedback}` })
        });

        if (response.ok) {
            console.log('Feedback sent successfully');
        } else {
            console.error('Error sending feedback:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending feedback:', error.message);
    }
}

function showNotification(message, iconUrl, linkUrl) {
    const notification = document.createElement('div');
    notification.className = 'popup'; // Use popup class for styling

    // Add image icon if provided
    if (iconUrl) {
        const iconElement = document.createElement('img');
        iconElement.className = 'notification-icon';
        iconElement.src = iconUrl;
        iconElement.alt = 'Icon';
        notification.appendChild(iconElement);
    }

    const messageElement = document.createElement('span');
    messageElement.className = 'notification-message';

    if (linkUrl) {
        // Create a link element if URL is provided
        const linkElement = document.createElement('a');
        linkElement.href = linkUrl;
        linkElement.target = '_blank'; // Open link in a new tab
        linkElement.textContent = message;
        linkElement.style.color = 'inherit'; // Inherit color from parent
        linkElement.style.textDecoration = 'underline'; // Add underline
        messageElement.appendChild(linkElement);
    } else {
        messageElement.textContent = message;
    }

    notification.appendChild(messageElement);
    document.body.appendChild(notification);

    // Trigger reflow to apply transitions
    window.getComputedStyle(notification).opacity;
    notification.classList.add('show');

    // Adjust timeout and remove logic to give it a smooth fade-out effect
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300); // Match this to the transition duration
    }, 3000);
}
