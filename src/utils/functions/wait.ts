export const wait = async (delay: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
};
