export function getEmail(name: string) {
    return (
        name
            .toLowerCase()
            .replace(/\s+/g, ".") + "@comp.com"
    );
}