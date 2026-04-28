const { db } = require('./src/config/firebase');

async function debugSurveys() {
    console.log('--- Debugging Surveys ---');
    try {
        const snapshot = await db.collection('surveys').limit(10).get();
        if (snapshot.empty) {
            console.log('No surveys found in collection "surveys"');
            return;
        }

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id} | Status: "${data.status}" | Title: ${data.title}`);
        });
    } catch (error) {
        console.error('Error fetching surveys:', error);
    }
}

debugSurveys();
