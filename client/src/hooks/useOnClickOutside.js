import { useEffect } from "react"

export const useOnclickOutside = (ref, handler) => {

    useEffect(() => {

        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        }

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.addEventListener("mousedown", listener);
            document.addEventListener("touchstart", listener);
        }
    }, [ref, handler])
}