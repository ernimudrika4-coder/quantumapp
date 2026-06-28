type RuntimeFlags = {
  workersStarted: boolean;
  schedulerStarted: boolean;
  bootedAt: number;
};

const runtimeState: RuntimeFlags = {
  workersStarted: false,
  schedulerStarted: false,
  bootedAt: Date.now(),
};

export function setWorkersStarted(v: boolean) {
  runtimeState.workersStarted = v;
}

export function setSchedulerStarted(v: boolean) {
  runtimeState.schedulerStarted = v;
}

export function getRuntimeState() {
  return runtimeState;
}
