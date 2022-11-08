import express from 'express';
import fetch from 'node-fetch';
import { Feed } from 'feed';
// Generate variables from default or environment
const PORT = process.env.PORT || 3000;
const ENDPOINT = process.env.ENDPOINT || '/';
const app = express();
app.get(ENDPOINT, async (req, res) => {
    // Required query parameters
    const url = (Array.isArray(req.query.url) ? req.query.url[0] : req.query.url);
    const title = (Array.isArray(req.query.title) ? req.query.title[0] : req.query.title);
    const itemTitle = (Array.isArray(req.query.item_title) ? req.query.item_title[0] : req.query.item_title);
    const itemLink = (Array.isArray(req.query.item_link) ? req.query.item_link[0] : req.query.item_link);
    const itemDate = (Array.isArray(req.query.item_date) ? req.query.item_date[0] : req.query.item_date);
    if (!url || !title || !itemTitle || !itemLink || !itemDate)
        return res.status(400).send('Missing or malformed parameters');
    // Optional query parameters
    const description = (Array.isArray(req.query.description) ? req.query.description[0] : req.query.description);
    const baseItemLink = (Array.isArray(req.query.base_item_link) ? req.query.base_item_link[0] : req.query.base_item_link);
    const itemDescription = (Array.isArray(req.query.item_description) ? req.query.item_description[0] : req.query.item_description);
    const itemImage = (Array.isArray(req.query.item_image) ? req.query.item_image[0] : req.query.item_image);
    // Get JSON data
    const feedResponse = await fetch(url);
    const feedData = await feedResponse.json();
    // Generate RSS feed
    const feed = new Feed({
        id: url,
        title,
        description: description || '',
        link: url,
        copyright: '',
    });
    for (const item of feedData) {
        feed.addItem({
            title: item[itemTitle],
            id: (baseItemLink || '') + item[itemLink],
            link: (baseItemLink || '') + item[itemLink],
            date: new Date(item[itemDate]),
            description: itemDescription ? item[itemDescription] : '',
            image: itemImage ? item[itemImage] : '',
        });
    }
    // Send RSS feed
    res.set('Content-Type', 'text/xml');
    res.send(feed.rss2());
});
app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});
