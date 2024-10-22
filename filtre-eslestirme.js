// pages/api/filters.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = await MongoClient.connect(uri);
    const db = client.db('filtre-db');
    const filters = await db.collection('filters').find({}).toArray();
    await client.close();
    res.json(filters);
  }
  
  if (req.method === 'POST') {
    const { filter } = req.body;
    const client = await MongoClient.connect(uri);
    const db = client.db('filtre-db');
    const result = await db.collection('filters').find({
      $or: [
        { original: { $regex: filter, $options: 'i' } },
        { alternatives: { $elemMatch: { $regex: filter, $options: 'i' } } }
      ]
    }).toArray();
    await client.close();
    res.json(result);
  }
}

// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  const searchFilters = async () => {
    const res = await fetch('/api/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: searchTerm })
    });
    const data = await res.json();
    setResults(data);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Filtre Eşleştirme Sistemi</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filtre kodunu girin..."
          className="w-full p-2 border rounded"
        />
        <button
          onClick={searchFilters}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ara
        </button>
      </div>
      
      <div className="grid gap-4">
        {results.map((filter, index) => (
          <div key={index} className="border p-4 rounded">
            <h2 className="font-bold">Orijinal: {filter.original}</h2>
            <div className="mt-2">
              <h3 className="font-semibold">Muadiller:</h3>
              <ul className="list-disc pl-5">
                {filter.alternatives.map((alt, i) => (
                  <li key={i}>{alt}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
