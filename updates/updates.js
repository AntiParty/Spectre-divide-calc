// updates.js
async function fetchUpdates() {
    try {
        const response = await fetch('../updates.json');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const updates = await response.json();
        console.log('Fetched updates:', updates); // Debugging statement

        const updatesSection = document.getElementById('updatesSection');
        updatesSection.innerHTML = '';

        updates.forEach(update => {
            const updateElement = document.createElement('div');
            updateElement.className = 'update-item';

            // Create HTML structure for the update
            updateElement.innerHTML = `
                <h3>Version ${update.version}</h3>
                <p>Date: ${update.date}</p>
                <ul>
                    ${update.notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            `;

            // Append the update element to the updates section
            updatesSection.appendChild(updateElement);
        });
    } catch (error) {
        console.error('Error fetching updates:', error);
    }
}

// Call the fetchUpdates function on page load
document.addEventListener('DOMContentLoaded', fetchUpdates);
