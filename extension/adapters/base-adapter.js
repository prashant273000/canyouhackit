class PlatformAdapter {
  matches(_element) {
    return false;
  }

  findPostElements(_root) {
    return [];
  }

  normalize(_element) {
    throw new Error("Platform adapters must implement normalize().");
  }
}
