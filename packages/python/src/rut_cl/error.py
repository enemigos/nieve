from __future__ import annotations

from rut_cl.types import RutIssue


class RutError(Exception):
    """Raised by ``parse`` when validation fails."""

    def __init__(self, issues: tuple[RutIssue, ...]) -> None:
        if not issues:
            message = "Invalid RUT"
        else:
            message = issues[0].message
        super().__init__(message)
        self.issues = issues
