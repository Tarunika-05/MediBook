const bcrypt = require("bcrypt");
const pool = require("./pool");

async function seed() {
  const client = await pool.connect();
  try {
    const { rows: existing } = await client.query(
      "SELECT id FROM users WHERE email = $1",
      ["dr.sarah.mitchell@medibook.com"]
    );

    if (existing.length > 0) {
      console.log("Rich seed data already exists, skipping");
      return;
    }

    const passwordHash = await bcrypt.hash("password123", 10);

    await client.query("BEGIN");

    // ─── PATIENTS ────────────────────────────────────────
    const patients = [
      { name: "Alex Johnson",    email: "alex.johnson@email.com"    },
      { name: "Maria Garcia",    email: "maria.garcia@email.com"    },
      { name: "David Chen",      email: "david.chen@email.com"      },
      { name: "Priya Patel",     email: "priya.patel@email.com"     },
      { name: "James Williams",  email: "james.williams@email.com"  },
      { name: "Sophie Turner",   email: "sophie.turner@email.com"   },
      { name: "Raj Kumar",       email: "raj.kumar@email.com"       },
      { name: "Emily Roberts",   email: "emily.roberts@email.com"   },
    ];

    const patientIds = [];
    for (const p of patients) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'PATIENT') RETURNING id`,
        [p.name, p.email, passwordHash]
      );
      patientIds.push(res.rows[0].id);
    }

    // ─── DOCTORS ─────────────────────────────────────────
    const doctorData = [
      {
        name:    "Sarah Mitchell",
        email:   "dr.sarah.mitchell@medibook.com",
        spec:    "Cardiology",
        exp:     12,
        fee:     180,
        bio:     "Board-certified cardiologist with 12 years at Mayo Clinic. Specializes in preventive cardiology, heart failure management, and advanced cardiac imaging. Published 30+ peer-reviewed papers.",
      },
      {
        name:    "James Okafor",
        email:   "dr.james.okafor@medibook.com",
        spec:    "Neurology",
        exp:     9,
        fee:     200,
        bio:     "Neurologist trained at Johns Hopkins, specializing in epilepsy, stroke rehabilitation, and movement disorders. Pioneer in minimally invasive neuro procedures.",
      },
      {
        name:    "Priya Nair",
        email:   "dr.priya.nair@medibook.com",
        spec:    "Pediatrics",
        exp:     7,
        fee:     120,
        bio:     "Compassionate pediatrician with expertise in child development, immunology, and adolescent health. Known for making kids feel comfortable during visits.",
      },
      {
        name:    "Robert Chen",
        email:   "dr.robert.chen@medibook.com",
        spec:    "Orthopedics",
        exp:     15,
        fee:     160,
        bio:     "Orthopedic surgeon specializing in sports injuries, joint replacement, and spine disorders. Team physician for professional athletes. Expert in robotic-assisted surgery.",
      },
      {
        name:    "Aisha Patel",
        email:   "dr.aisha.patel@medibook.com",
        spec:    "Dermatology",
        exp:     6,
        fee:     140,
        bio:     "Dermatologist with expertise in medical and cosmetic dermatology, including acne, eczema, psoriasis, and laser treatments. Completed fellowship at Harvard Medical School.",
      },
      {
        name:    "Thomas Weber",
        email:   "dr.thomas.weber@medibook.com",
        spec:    "Ophthalmology",
        exp:     11,
        fee:     150,
        bio:     "Ophthalmologist specializing in cataract surgery, LASIK, glaucoma treatment, and retinal disorders. Performed over 5,000 successful surgeries.",
      },
      {
        name:    "Fatima Al-Hassan",
        email:   "dr.fatima.alhassan@medibook.com",
        spec:    "Psychiatry",
        exp:     8,
        fee:     175,
        bio:     "Psychiatrist specializing in anxiety, depression, PTSD, and bipolar disorder. Evidence-based approach combining medication management with psychotherapy.",
      },
      {
        name:    "Carlos Rivera",
        email:   "dr.carlos.rivera@medibook.com",
        spec:    "Cardiology",
        exp:     14,
        fee:     190,
        bio:     "Interventional cardiologist with expertise in angioplasty, stent placement, and structural heart disease. Director of the Cardiac Catheterization Lab.",
      },
      {
        name:    "Mei Lin",
        email:   "dr.mei.lin@medibook.com",
        spec:    "Neurology",
        exp:     5,
        fee:     165,
        bio:     "Neurologist focused on headache disorders, multiple sclerosis, and neurodegenerative diseases. Passionate about integrating lifestyle medicine with traditional neurology.",
      },
      {
        name:    "David Osei",
        email:   "dr.david.osei@medibook.com",
        spec:    "Pediatrics",
        exp:     10,
        fee:     130,
        bio:     "Pediatrician with a special interest in childhood obesity, asthma, and developmental disorders. Volunteer doctor at international child health missions.",
      },
      {
        name:    "Natasha Ivanova",
        email:   "dr.natasha.ivanova@medibook.com",
        spec:    "Dermatology",
        exp:     13,
        fee:     155,
        bio:     "Senior dermatologist with 13 years of experience in skin cancer detection, Mohs surgery, and advanced cosmetic procedures. Author of 'Skin Deep: A Modern Guide'.",
      },
      {
        name:    "Marcus Thompson",
        email:   "dr.marcus.thompson@medibook.com",
        spec:    "Orthopedics",
        exp:     18,
        fee:     210,
        bio:     "Chief of Orthopedic Surgery with 18 years of experience. Pioneer in minimally invasive knee and hip replacement. Serves as consultant for three national sports teams.",
      },
    ];

    const doctorIds = [];
    for (const d of doctorData) {
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'DOCTOR') RETURNING id`,
        [d.name, d.email, passwordHash]
      );
      const drRes = await client.query(
        `INSERT INTO doctors (user_id, specialization, experience_years, consultation_fee, bio)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [userRes.rows[0].id, d.spec, d.exp, d.fee, d.bio]
      );
      doctorIds.push(drRes.rows[0].id);
    }

    // ─── SLOTS (next 7 days, multiple per doctor) ─────────
    const slotTemplates = [
      { start: 9,    end: 9.5  },
      { start: 10,   end: 10.5 },
      { start: 11,   end: 11.5 },
      { start: 14,   end: 14.5 },
      { start: 15,   end: 15.5 },
      { start: 16,   end: 16.5 },
    ];

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      for (let di = 0; di < doctorIds.length; di++) {
        // Each doctor gets 3-4 slots per day (staggered)
        const slots = slotTemplates.filter((_, i) => (i + di) % 2 === 0).slice(0, 4);
        for (const slot of slots) {
          const base = new Date();
          base.setDate(base.getDate() + dayOffset);
          const startTime = new Date(base);
          startTime.setHours(Math.floor(slot.start), (slot.start % 1) * 60, 0, 0);
          const endTime = new Date(base);
          endTime.setHours(Math.floor(slot.end), (slot.end % 1) * 60, 0, 0);
          await client.query(
            `INSERT INTO slots (doctor_id, start_time, end_time, status)
             VALUES ($1, $2, $3, 'AVAILABLE')`,
            [doctorIds[di], startTime, endTime]
          );
        }
      }
    }

    // ─── APPOINTMENTS (some booked slots) ─────────────────
    // Book 3 past appointments for the first 2 patients
    const appointmentPairs = [
      { patientId: patientIds[0], doctorId: doctorIds[0] },
      { patientId: patientIds[0], doctorId: doctorIds[2] },
      { patientId: patientIds[1], doctorId: doctorIds[1] },
      { patientId: patientIds[2], doctorId: doctorIds[3] },
    ];

    for (const pair of appointmentPairs) {
      // Create a slot in the past (already passed)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      pastDate.setHours(10, 0, 0, 0);
      const pastEnd = new Date(pastDate);
      pastEnd.setMinutes(30);

      const slotRes = await client.query(
        `INSERT INTO slots (doctor_id, start_time, end_time, status)
         VALUES ($1, $2, $3, 'BOOKED') RETURNING id`,
        [pair.doctorId, pastDate, pastEnd]
      );
      await client.query(
        `INSERT INTO appointments (patient_id, slot_id, status)
         VALUES ($1, $2, 'BOOKED')`,
        [pair.patientId, slotRes.rows[0].id]
      );
    }

    await client.query("COMMIT");

    console.log("✅ Rich seed data created successfully!");
    console.log("\n📋 Demo accounts (password: password123):");
    console.log("\n👤 Patients:");
    for (const p of patients) console.log(`   ${p.email}`);
    console.log("\n👨‍⚕️ Doctors:");
    for (const d of doctorData) console.log(`   ${d.email}  (${d.spec})`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = seed;
