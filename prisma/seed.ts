import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding started...");

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.carImage.deleteMany();
  await prisma.car.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing database records.");

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@rentcar.com",
      password: adminPassword,
      name: "Alexander Pierce",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      phone: "+1 (555) 019-2834",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "user@rentcar.com",
      password: userPassword,
      name: "Jane Doe",
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      phone: "+1 (555) 014-9988",
    },
  });

  console.log("Seeded users successfully.");

  // 2. Create Locations
  await prisma.location.create({
    data: {
      name: "Pune City Center",
      address: "FC Road, Shivajinagar, Pune, Maharashtra 411005",
      latitude: 18.5204,
      longitude: 73.8567,
    },
  });

  await prisma.location.create({
    data: {
      name: "Mumbai Airport Hub",
      address: "Chhatrapati Shivaji Maharaj International Airport, Mumbai, Maharashtra 400099",
      latitude: 19.0896,
      longitude: 72.8656,
    },
  });

  await prisma.location.create({
    data: {
      name: "Nashik Central Station",
      address: "Old Agra Road, Nashik, Maharashtra 422001",
      latitude: 19.9975,
      longitude: 73.7898,
    },
  });

  await prisma.location.create({
    data: {
      name: "Kolhapur Bus Terminal",
      address: "Station Road, Kolhapur, Maharashtra 416001",
      latitude: 16.7050,
      longitude: 74.2433,
    },
  });

  console.log("Seeded locations successfully.");

  // 3. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountPercent: 10,
        active: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      {
        code: "SUMMER25",
        discountPercent: 25,
        active: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        code: "ROADTRIP15",
        discountPercent: 15,
        active: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("Seeded coupons successfully.");

  // 4. Create Cars with Images
  const carsData = [
    {
      name: "911 Carrera S",
      brand: "Porsche",
      type: "Luxury",
      pricePerDay: 350.0,
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 4,
      slug: "porsche-911-carrera-s",
      description: "Experience the ultimate performance and timeless engineering of the Porsche 911 Carrera S. A sports car legend that pairs track-ready agility with premium everyday comfort.",
      features: JSON.stringify(["Sport Chrono Package", "Bose Surround Sound", "Adaptive Suspension", "Heated Seats", "Apple CarPlay", "LED Matrix Headlights"]),
      availability: true,
      rating: 4.9,
      images: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Model S Plaid",
      brand: "Tesla",
      type: "Electric",
      pricePerDay: 180.0,
      transmission: "Automatic",
      fuel: "Electric",
      seats: 5,
      slug: "tesla-model-s-plaid",
      description: "0 to 60 mph in under 2 seconds. The Tesla Model S Plaid is the quickest accelerating car in production. Equipped with tri-motor all-wheel drive, autopilot capabilities, and a futuristic yolk steering system.",
      features: JSON.stringify(["Autopilot Enabled", "1020 Horsepower", "Panoramic Glass Roof", "Tri-zone Climate Control", "Rear Seat Gaming Console", "Premium Audio System"]),
      availability: true,
      rating: 4.8,
      images: [
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "G-Class AMG G 63",
      brand: "Mercedes-Benz",
      type: "SUV",
      pricePerDay: 290.0,
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 5,
      slug: "mercedes-g63-amg",
      description: "The legendary G-Wagon merges off-road superiority with unmatched luxury. The handcrafted AMG V8 bi-turbo engine provides blistering power while the custom interior guarantees high comfort.",
      features: JSON.stringify(["V8 Bi-turbo Engine", "Burmester Sound", "Nappa Leather seating", "Three Locking Differentials", "Dynamic Ambient Lighting", "Active Lane Keeping"]),
      availability: true,
      rating: 4.95,
      images: [
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Mustang Mach-E GT",
      brand: "Ford",
      type: "Electric",
      pricePerDay: 110.0,
      transmission: "Automatic",
      fuel: "Electric",
      seats: 5,
      slug: "ford-mustang-mach-e-gt",
      description: "An all-electric SUV that brings the spirit of the Mustang muscle car. Fast charging, aggressive performance tires, and a spacious cockpit make this perfect for California road trips.",
      features: JSON.stringify(["Brembo Braking System", "B&O 10-Speaker Sound", "15.5-inch Touchscreen", "Ford Co-Pilot360", "Panoramic Fixed Glass Roof", "Hands-Free Liftgate"]),
      availability: true,
      rating: 4.7,
      images: [
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Range Rover Sport",
      brand: "Land Rover",
      type: "SUV",
      pricePerDay: 210.0,
      transmission: "Automatic",
      fuel: "Diesel",
      seats: 5,
      slug: "range-rover-sport",
      description: "Sophisticated styling, premium leather cabin, and outstanding off-road performance. The Range Rover Sport offers command driving position and active noise cancellation for a peaceful ride.",
      features: JSON.stringify(["Terrain Response 2", "Meridian Sound System", "Four-zone Climate Control", "Air Suspension", "Head-up Display", "3D Surround Camera"]),
      availability: true,
      rating: 4.85,
      images: [
        "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "M4 Competition Coupe",
      brand: "BMW",
      type: "Luxury",
      pricePerDay: 220.0,
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 4,
      slug: "bmw-m4-competition",
      description: "Uncompromised performance. With 503 horsepower, the BMW M4 Competition launches from 0 to 60 in 3.4 seconds. Carbon fiber detailing and dynamic drive selectors create the ultimate driving cockpit.",
      features: JSON.stringify(["M Sport Differential", "Harman Kardon Audio", "Carbon Fiber Bucket Seats", "M Drive Professional", "Adaptive LED Headlights", "Wireless Charger"]),
      availability: true,
      rating: 4.9,
      images: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Ioniq 5 Limited",
      brand: "Hyundai",
      type: "Electric",
      pricePerDay: 95.0,
      transmission: "Automatic",
      fuel: "Electric",
      seats: 5,
      slug: "hyundai-ioniq-5-limited",
      description: "Retro-futuristic styling meets cutting-edge 800V fast-charging technology. The Hyundai Ioniq 5 features fully reclining front relaxation seats and a flexible sliding center console.",
      features: JSON.stringify(["Ultra-Fast Charging", "Heated & Ventilated Seats", "Blind-Spot View Monitor", "V2L Charging Capabilities", "Head-up Display with AR", "Bose Premium Audio"]),
      availability: true,
      rating: 4.75,
      images: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Wrangler Rubicon 4xe",
      brand: "Jeep",
      type: "SUV",
      pricePerDay: 115.0,
      transmission: "Automatic",
      fuel: "Hybrid",
      seats: 5,
      slug: "jeep-wrangler-rubicon-4xe",
      description: "Go off-roading in silence with the Wrangler Plug-In Hybrid. Detachable roof and doors, mud-terrain tires, and locking axles provide the pure outdoor driving experience.",
      features: JSON.stringify(["Hybrid Fuel Efficiency", "Removable Doors/Roof", "True 4x4 Locking Axles", "Alpine Premium Audio", "Waterproof Push Button Start", "Rock Rails"]),
      availability: true,
      rating: 4.65,
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Civic Touring Edition",
      brand: "Honda",
      type: "Sedan",
      pricePerDay: 55.0,
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 5,
      slug: "honda-civic-touring",
      description: "The Honda Civic Touring combines sleek elegance with exceptional fuel economy. Features leather-trimmed seats, a 12-speaker Bose sound system, and advanced Honda Sensing safety features.",
      features: JSON.stringify(["Bose Sound System", "Honda Sensing Safety Suite", "Leather Seating", "Wireless Apple CarPlay", "Fuel-Efficient Eco Assist", "Power Sunroof"]),
      availability: true,
      rating: 4.6,
      images: [
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&w=800&q=80",
      ],
    },
  ];

  for (const carData of carsData) {
    const { images, ...carCore } = carData;
    const createdCar = await prisma.car.create({
      data: carCore,
    });

    for (const imgUrl of images) {
      await prisma.carImage.create({
        data: {
          carId: createdCar.id,
          url: imgUrl,
        },
      });
    }
  }

  console.log("Seeded cars and car images successfully.");

  // 5. Seed initial reviews
  const allCars = await prisma.car.findMany();
  for (const car of allCars) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        carId: car.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 star reviews
        comment: `Absolutely loved renting this ${car.brand} ${car.name}! The pickup was smooth at LAX and the car was clean, driving beautifully. Highly recommend!`,
      },
    });
  }

  console.log("Seeded reviews successfully.");

  // 6. Seed a sample booking for the user
  const sampleCar = allCars.find((c) => c.slug === "tesla-model-s-plaid");
  if (sampleCar) {
    const booking = await prisma.booking.create({
      data: {
        userId: customer.id,
        carId: sampleCar.id,
        pickupLocation: "Pune City Center",
        dropoffLocation: "Pune City Center",
        pickupDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        dropoffDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        totalPrice: sampleCar.pricePerDay * 2,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        couponCode: "WELCOME10",
        discount: sampleCar.pricePerDay * 2 * 0.1,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice - booking.discount,
        provider: "MOCK",
        status: "SUCCESS",
        transactionId: "TX_" + Math.random().toString(36).substring(2, 11).toUpperCase(),
      },
    });
  }

  // 7. Seed initial admin notifications
  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: "New Registration",
      message: `${customer.name} (${customer.email}) has registered a new user account.`,
      read: false,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
