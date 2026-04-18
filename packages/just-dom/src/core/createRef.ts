import { JDAllTags, JDRef } from "../types";

export const createRef = <T extends JDAllTags>() => {
  return { current: null } as JDRef<T>;
};
