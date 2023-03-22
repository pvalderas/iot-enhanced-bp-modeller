class EventBusLogger {
  constructor(eventBus) {
    const originalFire = eventBus.fire;

    eventBus.fire = function (type, data) {
      console.log(type, data);

      return originalFire.apply(eventBus, arguments);
    };
  }
}

export default {
  __init__: ["eventBus"],
  customPropertiesProvider: ["type", EventBusLogger]
};