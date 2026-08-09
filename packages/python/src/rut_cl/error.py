from __future__ import annotations

from rut_cl.types import RutIssue


class RutError(ValueError):
    """Raised by ``parse`` when validation fails."""

    def __init__(self, issue: RutIssue) -> None:
        super().__init__(issue.message)
        self.issue = issue
