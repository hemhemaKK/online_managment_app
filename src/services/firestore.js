import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  Timestamp,
} from "firebase/firestore";

// Get all events
export const getAllEvents = async () => {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Get username from Firestore users collection
export const getUserNameFromFirestore = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.username || "Unknown";
    } else {
      console.warn("No user document found");
      return "Unknown";
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Error";
  }
};

// Register for an event
export const registerUserForEvent = async (eventId, uid, email) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      registeredUsers: arrayUnion({ uid, email }),
    });
    console.log("Registered successfully!");
  } catch (error) {
    console.error("Registration failed:", error);
  }
};

// Add enquiry to specific event
export const addEnquiryToEvent = async (eventId, enquiryData) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      enquiries: arrayUnion({
        ...enquiryData,
        createdAt: Timestamp.now(),
        reply:"",
      }),
    });
    console.log("Enquiry added to event!");
  } catch (error) {
    console.error("Error adding enquiry to event:", error);
  }
};

export const updateEnquiriesInEvent = async (eventId, updatedEnquiries) => {
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, { enquiries: updatedEnquiries });
};

export const deleteUserEnquiry = async (eventId, timestamp) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const currentEnquiries = Array.isArray(eventData.enquiries) ? eventData.enquiries : [];

      const updatedEnquiries = currentEnquiries.filter(
        (enq) => enq.timestamp !== timestamp
      );

      await updateDoc(eventRef, { enquiries: updatedEnquiries });
    } else {
      console.error("Event not found for ID:", eventId);
    }
  } catch (error) {
    console.error("Error deleting enquiry:", error);
  }
};

// Reply to an enquiry
export const replyToEnquiry = async (eventId, createdAt, replyText) => {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) return;

  const data = eventSnap.data();
  const updated = data.enquiries?.map((e) =>
    e.createdAt?.seconds === createdAt?.seconds
      ? { ...e, reply: replyText }
      : e
  );

  await updateDoc(eventRef, { enquiries: updated });
};


const upgradeToVIP = async (months) => {
  const user = auth.currentUser;
  if (!user) return;

  const price = subscriptionPlans[months];
  if (!price) {
    console.error("Invalid plan selected");
    return;
  }

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + months);

  const userRef = doc(db, "users", user.uid);

  try {
    await updateDoc(userRef, {
      userType: "VIP",
      subscription: {
        startDate: now.toISOString(),
        endDate: end.toISOString(),
        durationInMonths: months,
        price: price,
        status: "active"
      },
    });
    alert(`🎉 VIP for ${months} month(s) at ₹${price} activated!`);
  } catch (error) {
    console.error("Error upgrading to VIP:", error);
  }
};

//key: "rzp_test_VGdiUsSDKJWAWe",