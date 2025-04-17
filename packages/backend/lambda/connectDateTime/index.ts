import { ConnectContactFlowEvent, Context } from 'aws-lambda';

export const handler = async (event: ConnectContactFlowEvent, context: Context) => {
    const {
        locale = process.env.defaultLocale,
        timeZone = process.env.defaultTimeZone,
    } = event.Details.Parameters || {};

    const date = new Date().toLocaleString(locale, {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return {
        date,
    };
};
