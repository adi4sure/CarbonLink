import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';
import EcoAction from './models/EcoAction.js';
import { Credit, Transaction, Listing } from './models/Credit.js';
import { generateTxHash, generateIpfsHash } from './utils/hashGenerator.js';
import { calculateCo2Offset } from './utils/co2Calculator.js';

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding CarbonLink database...\n');

    // Clear existing data
    await User.deleteMany({});
    await EcoAction.deleteMany({});
    await Credit.deleteMany({});
    await Transaction.deleteMany({});
    await Listing.deleteMany({});
    console.log('   ✓ Cleared existing data');

    // ─── Create Users ─────────────────────────────────────────
    const users = await User.create([
      {
        name: 'Aarav Sharma',
        email: 'aarav@carbonlink.io',
        password: 'password123',
        role: 'eco_actor',
        creditBalance: 0,
        totalCo2Offset: 0,
        totalEarnings: 0,
        isVerified: true,
      },
      {
        name: 'Priya Patel',
        email: 'priya@carbonlink.io',
        password: 'password123',
        role: 'eco_actor',
        creditBalance: 0,
        totalCo2Offset: 0,
        totalEarnings: 0,
        isVerified: true,
      },
      {
        name: 'Demo User',
        email: 'demo@carbonlink.io',
        password: 'password123',
        role: 'eco_actor',
        creditBalance: 0,
        totalCo2Offset: 0,
        totalEarnings: 0,
        isVerified: true,
      },
      {
        name: 'GreenCorp Buyer',
        email: 'buyer@carbonlink.io',
        password: 'password123',
        role: 'buyer',
        creditBalance: 0,
        totalCo2Offset: 0,
        totalEarnings: 0,
        isVerified: true,
      },
    ]);
    console.log(`   ✓ Created ${users.length} users`);

    const [aarav, priya, demo, buyer] = users;

    // ─── Create Eco-Actions ───────────────────────────────────
    const actionData = [
      {
        user: aarav._id,
        type: 'tree_planting',
        quantity: 50,
        description: 'Planted 50 native trees in the Western Ghats reforestation project.',
        proof: {
          photos: ['/uploads/tree_planting_1.jpg'],
          gps: { lat: 13.0827, lng: 80.2707 },
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          ipfsHash: generateIpfsHash('tree_planting_proof_1'),
        },
        verification: {
          status: 'approved',
          score: 0.92,
          notes: 'Verification passed with confidence 92%.',
          verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'CarbonLink AI Verification Engine v1.0',
        },
        co2Estimate: calculateCo2Offset('tree_planting', 50),
        creditsIssued: true,
      },
      {
        user: aarav._id,
        type: 'solar_panel',
        quantity: 5,
        description: 'Installed 5kW rooftop solar panel system for community center.',
        proof: {
          photos: ['/uploads/solar_1.jpg'],
          gps: { lat: 11.0168, lng: 76.9558 },
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          ipfsHash: generateIpfsHash('solar_proof_1'),
        },
        verification: {
          status: 'approved',
          score: 0.88,
          notes: 'Solar panel installation verified. 5kW capacity confirmed.',
          verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'CarbonLink AI Verification Engine v1.0',
        },
        co2Estimate: calculateCo2Offset('solar_panel', 5),
        creditsIssued: true,
      },
      {
        user: priya._id,
        type: 'composting',
        quantity: 500,
        description: 'Community composting facility processing 500kg organic waste weekly.',
        proof: {
          photos: ['/uploads/compost_1.jpg'],
          gps: { lat: 18.5204, lng: 73.8567 },
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          ipfsHash: generateIpfsHash('compost_proof_1'),
        },
        verification: {
          status: 'approved',
          score: 0.85,
          notes: 'Composting operation verified.',
          verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'CarbonLink AI Verification Engine v1.0',
        },
        co2Estimate: calculateCo2Offset('composting', 500),
        creditsIssued: true,
      },
      {
        user: priya._id,
        type: 'sustainable_farming',
        quantity: 2,
        description: 'Converted 2 hectares to organic sustainable farming.',
        proof: {
          photos: ['/uploads/farm_1.jpg'],
          gps: { lat: 19.7515, lng: 75.7139 },
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ipfsHash: generateIpfsHash('farm_proof_1'),
        },
        verification: {
          status: 'approved',
          score: 0.91,
          notes: 'Sustainable farming transition verified.',
          verifiedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'CarbonLink AI Verification Engine v1.0',
        },
        co2Estimate: calculateCo2Offset('sustainable_farming', 2),
        creditsIssued: true,
      },
      {
        user: demo._id,
        type: 'tree_planting',
        quantity: 25,
        description: 'Planted 25 fruit trees in urban community garden.',
        proof: {
          photos: ['/uploads/demo_trees.jpg'],
          gps: { lat: 28.6139, lng: 77.2090 },
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          ipfsHash: generateIpfsHash('demo_trees'),
        },
        verification: {
          status: 'approved',
          score: 0.87,
          notes: 'Verification passed. 25 trees confirmed.',
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'CarbonLink AI Verification Engine v1.0',
        },
        co2Estimate: calculateCo2Offset('tree_planting', 25),
        creditsIssued: true,
      },
      {
        user: demo._id,
        type: 'reforestation',
        quantity: 1,
        description: 'Participated in 1 hectare reforestation drive.',
        proof: {
          photos: ['/uploads/demo_forest.jpg'],
          gps: { lat: 27.5946, lng: 75.6913 },
          timestamp: new Date().toISOString(),
          ipfsHash: generateIpfsHash('demo_forest'),
        },
        verification: {
          status: 'pending',
          score: null,
          notes: null,
        },
        co2Estimate: calculateCo2Offset('reforestation', 1),
        creditsIssued: false,
      },
    ];

    const actions = [];
    for (const ad of actionData) {
      const action = await EcoAction.create(ad);
      actions.push(action);
    }
    console.log(`   ✓ Created ${actions.length} eco-actions`);

    // ─── Mint Credits for approved actions ────────────────────
    const approvedActions = actions.filter(a => a.verification?.status === 'approved');
    let totalCreditsCreated = 0;

    for (const action of approvedActions) {
      const txHash = generateTxHash();
      await Credit.create({
        owner: action.user,
        amount: action.co2Estimate,
        sourceAction: action._id,
        txHash,
        status: 'active',
      });

      await Transaction.create({
        type: 'mint',
        to: action.user,
        amount: action.co2Estimate,
        txHash,
      });

      await User.findByIdAndUpdate(action.user, {
        $inc: {
          creditBalance: action.co2Estimate,
          totalCo2Offset: action.co2Estimate,
        },
      });

      totalCreditsCreated++;
    }
    console.log(`   ✓ Minted ${totalCreditsCreated} credit records`);

    // ─── Create Marketplace Listings ──────────────────────────
    await Listing.create({
      seller: aarav._id,
      amount: 500,
      pricePerKg: 12.50,
      totalPrice: 6250,
      description: '500 kg CO₂ credits from verified tree planting in Western Ghats.',
      actionType: 'tree_planting',
      status: 'active',
    });

    await Listing.create({
      seller: priya._id,
      amount: 100,
      pricePerKg: 8.00,
      totalPrice: 800,
      description: '100 kg CO₂ credits from community composting in Pune.',
      actionType: 'composting',
      status: 'active',
    });

    await Listing.create({
      seller: priya._id,
      amount: 2000,
      pricePerKg: 15.00,
      totalPrice: 30000,
      description: '2,000 kg CO₂ credits from sustainable farming transition.',
      actionType: 'sustainable_farming',
      status: 'active',
    });

    console.log(`   ✓ Created 3 marketplace listings`);

    // ─── Summary ──────────────────────────────────────────────
    console.log('\n✅ Seed complete!\n');
    console.log('   Demo accounts:');
    console.log('   ─────────────');
    console.log('   📧 demo@carbonlink.io    / password123  (Eco Actor)');
    console.log('   📧 aarav@carbonlink.io   / password123  (Eco Actor)');
    console.log('   📧 priya@carbonlink.io   / password123  (Eco Actor)');
    console.log('   📧 buyer@carbonlink.io   / password123  (Buyer)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
