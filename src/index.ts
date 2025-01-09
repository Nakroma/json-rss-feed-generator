import express from 'express';
import fetch from 'node-fetch';
import { Feed } from 'feed';

interface JSONFeedItem {
    [key: string]: any;
}

// Generate variables from default or environment
const PORT = process.env.PORT || 3000;
const ENDPOINT = process.env.ENDPOINT || '/';

const app = express();

app.get(ENDPOINT, async (req, res) => {
    // Required query parameters
    const url = (Array.isArray(req.query.url) ? req.query.url[0] : req.query.url) as string | undefined;
    const title = (Array.isArray(req.query.title) ? req.query.title[0] : req.query.title) as string | undefined;
    const itemTitle = (Array.isArray(req.query.item_title) ? req.query.item_title[0] : req.query.item_title) as string | undefined;
    const itemLink = (Array.isArray(req.query.item_link) ? req.query.item_link[0] : req.query.item_link) as string | undefined;
    const itemDate = (Array.isArray(req.query.item_date) ? req.query.item_date[0] : req.query.item_date) as string | undefined;
    if (!url || !title || !itemTitle || !itemLink || !itemDate)
        return res.status(400).send('Missing or malformed parameters');

    // Optional query parameters
    const description = (Array.isArray(req.query.description) ? req.query.description[0] : req.query.description) as string | undefined;
    const baseItemLink = (Array.isArray(req.query.base_item_link) ? req.query.base_item_link[0] : req.query.base_item_link) as string | undefined;
    const itemDescription = (Array.isArray(req.query.item_description) ? req.query.item_description[0] : req.query.item_description) as string | undefined;
    const itemImage = (Array.isArray(req.query.item_image) ? req.query.item_image[0] : req.query.item_image) as string | undefined;
    const dataPath = (Array.isArray(req.query.data_path) ? req.query.data_path[0] : req.query.data_path) as string | undefined;

    try {
        // Get JSON data
        const feedResponse = await fetch(url);
        let feedData = await feedResponse.json() as JSONFeedItem[] | { [key: string]: any };

        if (dataPath && !Array.isArray(feedData)) {
            const dataPathArray = dataPath.split('.');
            for (const path of dataPathArray) {
                if (feedData.hasOwnProperty(path)) {
                    feedData = (feedData as { [key: string]: any })[path];
                } else {
                    return res.status(400).send('Supplied data path does not exist');
                }
            }
        }

        if (!Array.isArray(feedData)) {
            return res.status(400).send('Supplied data path is not an array');
        }

        // Generate RSS feed
        const feed = new Feed({
            id: url,
            title,
            description: description || '',
            link: url,
            copyright: '',
        })
        for (const item of feedData) {
            feed.addItem({
                title: item[itemTitle],
                id: (baseItemLink || '') + item[itemLink],
                link: (baseItemLink || '') + item[itemLink],
                date: new Date(item[itemDate]),
                description: itemDescription ? item[itemDescription] : '',
                image: itemImage ? item[itemImage] : '',
            })
        }

        // Send RSS feed
        res.set('Content-Type', 'text/xml');
        res.send(feed.rss2());
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
})
