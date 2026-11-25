import * as Calendar from "expo-calendar/legacy";
import { Platform } from "react-native";

// Adds a reminder for the expected delivery, 3 days from now at 10:00.
export async function addDeliveryReminder(orderId: number) {
  const permission = await Calendar.requestCalendarPermissionsAsync();
  if (!permission.granted) return { ok: false as const };

  let calendarId: string | undefined;
  if (Platform.OS === "ios") {
    calendarId = (await Calendar.getDefaultCalendarAsync()).id;
  } else {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT,
    );
    calendarId = calendars.find((c) => c.allowsModifications)?.id;
  }
  if (!calendarId) throw new Error("No calendar found on this phone");

  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  await Calendar.createEventAsync(calendarId, {
    title: `ShopX delivery: order #${orderId}`,
    startDate: start,
    endDate: end,
    notes: "Expected delivery of your ShopX order.",
    alarms: [{ relativeOffset: -60 }],
  });
  return { ok: true as const, when: start };
}
