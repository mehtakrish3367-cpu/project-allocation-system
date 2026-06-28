import Map "mo:core/Map";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Student = {
    id : Nat;
    name : Text;
  };

  type Project = {
    id : Nat;
    name : Text;
    description : Text;
  };

  type AllocationResult = {
    matches : [(Nat, Nat)]; // (studentId, projectId)
    unmatchedStudents : [Nat];
  };

  let students = Map.empty<Nat, Student>();
  let projects = Map.empty<Nat, Project>();
  let preferences = Map.empty<Nat, [Nat]>(); // studentId -> projectIds

  var latestAllocation : ?AllocationResult = null;

  // Student Management
  public shared ({ caller }) func addStudent(id : Nat, name : Text) : async Bool {
    students.add(id, { id; name });
    true;
  };

  public query ({ caller }) func getStudents() : async [Student] {
    students.values().toArray();
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async Bool {
    students.remove(id);
    preferences.remove(id);
    true;
  };

  // Project Management
  public shared ({ caller }) func addProject(id : Nat, name : Text, description : Text) : async Bool {
    projects.add(id, { id; name; description });
    true;
  };

  public query ({ caller }) func getProjects() : async [Project] {
    projects.values().toArray();
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async Bool {
    projects.remove(id);
    projects.containsKey(id);
  };

  // Preferences Management
  public shared ({ caller }) func setPreferences(studentId : Nat, projectIds : [Nat]) : async Bool {
    if (students.containsKey(studentId)) {
      preferences.add(studentId, projectIds);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getPreferences(studentId : Nat) : async ?[Nat] {
    preferences.get(studentId);
  };

  // Matching Algorithm (DFS-based Bipartite Matching)
  func dfs(studentId : Nat, visitedProjects : Set.Set<Nat>, projectMatches : Map.Map<Nat, Nat>) : Bool {
    switch (preferences.get(studentId)) {
      case (?prefs) {
        for (projectId in prefs.values()) {
          if (not visitedProjects.contains(projectId)) {
            visitedProjects.add(projectId);
            switch (projectMatches.get(projectId)) {
              case (null) {
                projectMatches.add(projectId, studentId);
                return true;
              };
              case (?otherStudent) {
                if (dfs(otherStudent, visitedProjects, projectMatches)) {
                  projectMatches.add(projectId, studentId);
                  return true;
                };
              };
            };
          };
        };
      };
      case (null) {};
    };
    false;
  };

  // Find Maximum Matching
  func findMatching() : Map.Map<Nat, Nat> {
    let projectMatches = Map.empty<Nat, Nat>();

    for ((studentId, _student) in students.entries()) {
      let visitedProjects = Set.empty<Nat>();
      ignore dfs(studentId, visitedProjects, projectMatches);
    };

    projectMatches;
  };

  public shared ({ caller }) func allocateProjects() : async AllocationResult {
    let projectMatches = findMatching();

    let unmatchedStudents = List.empty<Nat>();
    for ((studentId, _student) in students.entries()) {
      var matched = false;
      for ((_, sId) in projectMatches.entries()) {
        if (sId == studentId) { matched := true };
      };
      if (not matched) {
        unmatchedStudents.add(studentId);
      };
    };

    let matches = projectMatches.toArray();
    let unmatchedArray = unmatchedStudents.toArray();

    let result : AllocationResult = {
      matches;
      unmatchedStudents = unmatchedArray;
    };

    latestAllocation := ?result;
    result;
  };

  public query ({ caller }) func getLatestAllocation() : async ?AllocationResult {
    latestAllocation;
  };

  public query ({ caller }) func getStats() : async {
    totalStudents : Nat;
    totalProjects : Nat;
    matchedCount : Nat;
    unmatchedCount : Nat;
  } {
    let totalStudents = students.size();
    let totalProjects = projects.size();

    var matchedCount = 0;
    var unmatchedCount = totalStudents;

    switch (latestAllocation) {
      case (?alloc) {
        matchedCount := alloc.matches.size();
        unmatchedCount := alloc.unmatchedStudents.size();
      };
      case (null) {};
    };

    {
      totalStudents;
      totalProjects;
      matchedCount;
      unmatchedCount;
    };
  };

  public shared ({ caller }) func clearAll() : async Bool {
    students.clear();
    projects.clear();
    preferences.clear();
    latestAllocation := null;
    true;
  };
};
