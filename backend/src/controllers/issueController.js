import mongoose from "mongoose";
import Issue from "../models/Issue.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

export async function issueBook(req, res) {
  try {
    const bookId = req.body.bookId || req.body.book;
    const studentId = req.body.studentId || req.body.student;
    const { dueDate } = req.body;

    if (!bookId || !studentId) {
      return res.status(400).json({ message: "Book and student are required" });
    }

    if (!mongoose.isValidObjectId(bookId) || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid book or student ID" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "No copies available for this book" });
    }

    const activeIssue = await Issue.findOne({
      book: bookId,
      student: studentId,
      status: "ISSUED"
    });

    if (activeIssue) {
      return res.status(400).json({ message: "Student already has an active issue for this book" });
    }

    const returnDue = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const issue = new Issue({
      book: bookId,
      student: studentId,
      dueDate: returnDue
    });

    await issue.save();

    book.availableCopies -= 1;
    await book.save();

    await issue.populate("book", "title author isbn category");
    await issue.populate("student", "name email");

    return res.status(201).json({
      message: "Book issued successfully",
      issue
    });
  } catch (error) {
    console.error("Error issuing book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function returnBook(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid issue ID" });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue record not found" });
    }

    if (issue.status === "RETURNED") {
      return res.status(400).json({ message: "Book has already been returned" });
    }

    issue.status = "RETURNED";
    issue.returnDate = new Date();
    await issue.save();

    const book = await Book.findById(issue.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    await issue.populate("book", "title author isbn category");
    await issue.populate("student", "name email");

    return res.status(200).json({
      message: "Book returned successfully",
      issue
    });
  } catch (error) {
    console.error("Error returning book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyBorrowedBooks(req, res) {
  try {
    const issues = await Issue.find({ student: req.user._id })
      .populate("book", "title author isbn category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllIssues(req, res) {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const issues = await Issue.find(filter)
      .populate("book", "title author isbn category")
      .populate("student", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error("Error fetching issue records:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
