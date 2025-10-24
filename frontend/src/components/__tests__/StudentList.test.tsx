import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StudentList from "../Student/StudentList";
import type { Student } from "../../types";
import { StudentStatus } from "../../types";

describe("StudentList", () => {
  const mockStudents: Student[] = [
    {
      student_id: "S001",
      name: "張三",
      email: "zhang@example.com",
      nationality: "中國",
      program: "資訊工程系",
      enrollment_date: "2023-09-01",
      status: StudentStatus.ACTIVE,
      created_at: "2023-09-01",
      updated_at: "2023-09-01",
    },
  ];

  it("renders student list with data", () => {
    const mockOnPageChange = vi.fn();
    const mockOnViewDetails = vi.fn();

    render(
      <StudentList
        students={mockStudents}
        total={1}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("S001")).toBeInTheDocument();
    expect(screen.getByText("張三")).toBeInTheDocument();
    expect(screen.getByText("中國")).toBeInTheDocument();
    expect(screen.getByText("資訊工程系")).toBeInTheDocument();
  });

  it("displays correct status tag", () => {
    const mockOnPageChange = vi.fn();
    const mockOnViewDetails = vi.fn();

    render(
      <StudentList
        students={mockStudents}
        total={1}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("在學")).toBeInTheDocument();
  });
});
