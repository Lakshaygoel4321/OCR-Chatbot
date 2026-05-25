import ChatWindow from "./components/chat/ChatWindow";

export default function App() {
  return (
    <>
      {/* Skip link for keyboard users to jump to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <ChatWindow />
    </>
  );
}