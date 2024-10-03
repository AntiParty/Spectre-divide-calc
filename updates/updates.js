async function fetchUpdates() {
    try {
        const response = await fetch('../updates.json');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const updates = await response.json();
        console.log('Fetched updates:', updates);

        const updatesSection = document.getElementById('updatesSection');
        updatesSection.innerHTML = '';

        if (updates.length === 0) {
            console.warn('No updates available to display.');
            return; 
        }

        // Reverse the updates array to display the latest update first
        updates.reverse().forEach((update, index) => {
            const updateElement = document.createElement('div');
            updateElement.className = 'update-item';

            const notes = index === 0 
                ? ['Newest Update!', ...update.notes] // Add "Newest Update!" as the first note
                : update.notes;

            updateElement.innerHTML = `
                <h3>Version ${update.version}</h3>
                <p>Date: ${update.date}</p>
                <ul>
                    ${notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            `;

            updatesSection.appendChild(updateElement);
        });
    } catch (error) {
        console.error('Error fetching updates:', error);
    }
}

// Call the fetchUpdates function on page load
document.addEventListener('DOMContentLoaded', fetchUpdates);
