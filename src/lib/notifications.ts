import { showNotification } from "@mantine/notifications";

export function notifyError(title: string, message: string, error: Error): void {
    showNotification({
        title: title,
        message: message,
        color: "red"
    });
    console.error(error);
}
