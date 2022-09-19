global.setImmediate = jest.useRealTimers as unknown as typeof setImmediate;
import "@testing-library/jest-dom";
