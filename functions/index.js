const functions = require('firebase-functions');
require('dotenv').config();

const admin = require('firebase-admin');
const { TwitterApi } = require('twitter-api-v2');
const { Configuration, OpenAIApi } = require('openai');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

admin.initializeApp();
const dbRef = admin.firestore().doc('tokens/demo');

const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const callbackURL = process.env.CALLBACK_URL;

const openaiConfig = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(openaiConfig);

const chartNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });

// STEP 1 - Auth URL
exports.auth = functions.https.onRequest(async(request, response) => {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
        callbackURL, { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] }
    );

    await dbRef.set({ codeVerifier, state });
    response.redirect(url);
});

// STEP 2 - Verify callback code, store access_token
exports.callback = functions.https.onRequest(async(request, response) => {
    const { state, code } = request.query;

    const dbSnapshot = await dbRef.get();
    const { codeVerifier, state: storedState } = dbSnapshot.data();

    if (state !== storedState) {
        return response.status(400).send('Stored tokens do not match!');
    }

    const {
        client: loggedClient,
        accessToken,
        refreshToken,
    } = await twitterClient.loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: callbackURL,
    });

    await dbRef.set({ accessToken, refreshToken });
    const { data } = await loggedClient.v2.me();
    response.send(data);
});

// Generate topics for tweets
async function generateTrendingTopicsTweet() {
    const trendingTopics = [
        'Web3', 'Blockchain', 'AI', 'Machine Learning', 'Web Development', 'Quantum Computing'
    ];
    const prompt = `Generate an engaging tweet about the following trending topics: ${trendingTopics.join(", ")} with hashtags.`;
    const result = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 100,
    });
    return result.data.choices[0].text.trim();
}

// Auto-schedule and post tweets
exports.scheduleTweets = functions.pubsub.schedule('every 24 hours').onRun(async() => {
    const { refreshToken } = (await dbRef.get()).data();

    const {
        client: refreshedClient,
        accessToken,
        refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    for (let i = 0; i < 10; i++) {
        const tweetText = await generateTrendingTopicsTweet();
        await refreshedClient.v2.tweet({ text: tweetText });
    }
});

// Auto-comment and reply
exports.autoEngagement = functions.pubsub.schedule('every 6 hours').onRun(async() => {
    const { refreshToken } = (await dbRef.get()).data();

    const {
        client: refreshedClient,
        accessToken,
        refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    const tweets = await refreshedClient.v2.search('from:TechTwitter OR #TechTwitter', { max_results: 5 });

    for (const tweet of tweets.data) {
        const commentPrompt = `Write an engaging reply to this tweet: "${tweet.text}" with a focus on adding value.`;
        const comment = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: commentPrompt,
            max_tokens: 100,
        });

        await refreshedClient.v2.reply(comment.data.choices[0].text.trim(), tweet.id);
    }
});