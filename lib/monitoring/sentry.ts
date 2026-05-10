import * as Sentry from "@sentry/nextjs";

type SentryLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

type CaptureAppIssueInput = {
  feature: string;
  action: string;
  level?: SentryLevel;
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, unknown>;
};

export function captureAppException(
  error: unknown,
  {
    feature,
    action,
    level = "error",
    tags,
    extra,
  }: CaptureAppIssueInput,
) {
  Sentry.captureException(error, {
    level,
    tags: {
      feature,
      action,
      ...tags,
    },
    extra,
  });
}

export function captureAppMessage(
  message: string,
  {
    feature,
    action,
    level = "warning",
    tags,
    extra,
  }: CaptureAppIssueInput,
) {
  Sentry.captureMessage(message, {
    level,
    tags: {
      feature,
      action,
      ...tags,
    },
    extra,
  });
}
