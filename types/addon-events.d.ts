/**
 * {@link https://developers.google.com/workspace/add-ons/concepts/event-objects}
 */
declare namespace GoogleAppsScript.AddOn {

    /**
     * {@link GoogleAppsScript.Card_Service.TextInput}: a list of strings (only one element).
     * {@link GoogleAppsScript.Card_Service.SelectionInput}: a list of strings.
     */
    interface StringInputs {
        value: string[];
    }

    /**
     * For {@link GoogleAppsScript.Card_Service.DateTimePicker}
     */
    interface DateTimeInput {
        /** true if the input date time includes a date; if false only a time is included. */
        hasDate: boolean;
        /** true if the input date time includes a time; if false only a date is included. */
        hasTime: boolean;
        /** The time selected by the user, in milliseconds since epoch (00:00:00 UTC on 1 January 1970). */
        msSinceEpoch: number;
    }

    /**
     * For {@link GoogleAppsScript.Card_Service.DatePicker}
     */
    interface DateInput {
        /** The time selected by the user, in milliseconds since epoch (00:00:00 UTC on 1 January 1970). */
        msSinceEpoch: number;
    }

    /**
     * For {@link GoogleAppsScript.Card_Service.TimePicker}
     */
    interface TimeInput {
        /** The hour number selected by the user. */
        hours: number;
        /** The minute number selected by the user. */
        minutes: number;
    }

    /**
     * Helper type for different types of formInputs
     */
    interface FormInputEntry {
        stringInputs?: StringInputs;
        dateTimeInput?: DateTimeInput;
        dateInput?: DateInput;
        timeInput?: TimeInput;
    }

    /**
     * Disabled by default. The timezone ID and offset. To turn on this field,
     * you must set addOns.common.useLocaleFromApp to true in your add-on's
     * manifest. Your add-on's scope list must also include
     * https://www.googleapis.com/auth/script.locale.
     */
    interface TimeZone {
        /** The timezone identifier of the user's timezone */
        id: string;
        /** The time offset from Coordinated Universal Time (UTC) of the user's timezone, measured in milliseconds */
        offset: number;
    }

    /** The common event object is the portion of the overall event object
     * that carries general, host-independent information to the add-on from
     * the user's client */
    interface CommonEvent {
        /** Indicates where the event originates */
        platform: 'WEB' | 'IOS' | 'ANDROID';
        /** Indicates the host app the add-on is active in when the event object is generated. */
        hostApp: 'GMAIL' | 'CALENDAR' | 'DRIVE' | 'DOCS' | 'SHEETS' | 'SLIDES';
        /** A map containing the current values of the widgets in the displayed card */
        formInputs?: Record<string, FormInputEntry>;
        /** Any additional parameters you supply to an action */
        parameters?: Record<string, string>;
        /** The user's language and country/region identifier in the format of ISO 639 language code-ISO 3166 country/region code. For example, en-US. */
        userLocale?: string;
        /** The timezone ID and offset */
        timeZone?: TimeZone;
    }

    /**
     * Attendee objects carry information about individual attendees to
     * Google Calendar events. This information is present in the event object
     * if and only if the data is present in the Calendar event and the add-on
     * sets its addOns.calendar.currentEventAccess manifest field to
     * READ or READ_WRITE.
     */
    interface Attendee {
        /** The number of additional guests the attendee had indicated they are bringing. Defaults to zero. */
        additionalGuests: number;
        /** The attendee's response comment, if any. */
        comment: string;
        /** The attendee displayed name. */
        displayName: string;
        /** The attendee email address. */
        email: string;
        /** true if the attendance for this attendee is marked as optional; false otherwise */
        optional: boolean;
        /** true if the attendee is an organizer for this event */
        organizer: boolean;
        /** true if the attendee represents a resource, such as room or piece of equipment; false otherwise. */
        resource: boolean;
        /** The attendee's response status */
        responseStatus: 'accepted' | 'declined' | 'needsAction' | 'tentative';
        /** true if this attendee represents the calendar in which this event appears; false otherwise. */
        self: boolean;
    }

    /**
     * User-generated data.
     * An object describing the capabilities of the add-on to view or update event information.
     */
    interface CalendarCapabilities {
        /** true if the add-on can add new attendees to the event attendee list; false otherwise. */
        canAddAttendees?: boolean;
        /** true if the add-on can read the event attendee list; false otherwise. */
        canSeeAttendees?: boolean;
        /** true if the add-on can read the event conference data; false otherwise. */
        canSeeConferenceData?: boolean;
        /** true if the add-on can update the event conference data; false otherwise. */
        canSetConferenceData?: boolean;
        /** true if the add-on can add new attachments to the event; false otherwise. */
        canAddAttachments?: boolean;
    }

    /**
     * An object representing the conference solution, such as Hangouts or Google Meet
     */
    interface ConferenceSolution {
        /** The URI for the user-visible icon representing this conference solution */
        iconUri: string;
        /** The key which uniquely identifies the conference solution for this event */
        key: { type: 'eventHangout' | 'eventNamedHangout' | 'hangoutsMeet' };
        /** The user-visible name of this conference solution (not localized). */
        name: string;
    }

    /**
     * Entry point objects carry information about the established means of
     * accessing a given conference, such as by phone or video. This
     * information is present in the event object if and only if the data is
     * present in the Calendar event and the add-on sets its
     * addOns.calendar.currentEventAccess manifest field to READ or READ_WRITE.
     */
    interface EntryPoint {
        /** The access code used to access the conference */
        accessCode: string;
        /** Features of the entry point. Currently these features only apply to phone entry points */
        entryPointFeatures: ('toll' | 'toll_free')[];
        /** The type of entry point */
        entryPointType: 'more' | 'phone' | 'sip' | 'video';
        /** The user-visible label for the entry point URI (not localized). */
        label: string;
        /** The meeting code used to access the conference */
        meetingCode: string;
        /** The passcode used to access the conference */
        passcode?: string;
        /** The password used to access the conference */
        password?: string;
        /** The PIN used to access the conference */
        pin?: string;
        /** Region code of the phone number */
        regionCode: string;
        /** The URI of the entry point */
        uri: string;
    }

    /**
     * Conference data objects carry information about conferences that are
     * attached to Google Calendar events. These can be Google conference
     * solutions, such as Google Meet, or third-party conferences. This
     * information is present in the event object if and only if the data is
     * present in the Calendar event and the add-on sets its 
     * addOns.calendar.currentEventAccess manifest field to READ or READ_WRITE
     */
    interface ConferenceData {
        /** The ID of the conference. This ID is meant to allow applications to keep track of conferences; you shouldn't display this ID to users */
        conferenceId: string;
        /** An object representing the conference solution, such as Hangouts or Google Meet */
        conferenceSolution: ConferenceSolution;
        /** The list of conference entry points, such as URLs or phone numbers */
        entryPoints: EntryPoint[];
        /** Additional notes about the conference to display to the user */
        notes: string;
        /** An object containing a map of defined parameter data for use by the add-on */
        parameters: { addOnParameters: Record<string, string> };
    }

    /**
     * The Calendar event object is the portion of the overall event object
     * that carries information about a user's calendar and calendar events.
     * It's only present in an event object if the add-on extends
     * Google Calendar
     */
    interface Calendar {
        /** list of attendee objects */
        attendees: Attendee[];
        /** The calendar ID. */
        calendarId: string;
        /** An object describing the capabilities of the add-on to view or update event information. */
        capabilities: CalendarCapabilities;
        /** An object representing any conference data associated with this event, such as Google Meet conference details */
        conferenceData?: ConferenceData;
        /** The event ID */
        id: string;
        /** The event organizer's email address. */
        organizer: { email: string };
        /** The ID of a recurring event */
        recurringEventId: string;
    }


    interface DriveItem {
        id: string;
        title: string;
        mimeType: string;
        iconUrl: string;
    }


    interface DriveContext {

    }

    /**
     * Event objects are JSON structures that are automatically constructed and
     * passed as parameters to trigger or callback functions when a user
     * interacts with an add-on. Event objects carry client-side information
     * about the host app and the current context to the add-on's server-side
     * callback function.
     */
    interface AddOnEvent {
        /** An object containing information common to all event objects, regardless of the host application. */
        commonEventObject: CommonEvent;
        /** Only present if the calling host is Google Calendar. An object containing calendar and event information. */
        calendar?: Calendar;
        parameters?: Record<string, string>;
        drive?: object;
    }
}