export default interface CanvasSubmission {
    id: number;
    quiz_id: number;
    quiz_version: number;
    user_id: number;
    submission_id: number; // WATCH OUT! Probably not what you want
    score: number;
    kept_score: number;
    started_at: string;
    end_at: string;
    finished_at: string;
    attempt: number;
    workflow_state: "pending_review"|string;
    fudge_points: unknown;
    quiz_points_possible: number;
    extra_attempts: unknown;
    extra_time: unknown;
    manually_unlocked: unknown;
    validation_token: string;
    score_before_regrade?: number|null;
    has_seen_results: unknown;
    time_spent: number;
    attempts_left: number;
    overdue_and_needs_submission: boolean;
    "excused?": boolean;
    html_url: string;
    result_url: string;
}